import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';      
import { MatchRoom } from './components/MatchRoom'; 

export default function YourMatches() {
  const [nextMatches, setNextMatches] = useState([]);
  const [historyMatches, setHistoryMatches] = useState([]);
  const [currentUserName, setCurrentUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getMyMatchesData() {
      try {
        setLoading(true);

        // 1. 获取 Auth 信息
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setLoading(false);
          return;
        }

        const uid = user.id;

        // 2. 获取 registrations 表中的昵称
        const { data: regData } = await supabase
          .from('registrations')
          .select('player_name')
          .eq('user_id', uid)
          .maybeSingle();

        setCurrentUserName(regData?.player_name || '');

        // 3. 捞出花名册
        const { data: allPlayers } = await supabase
          .from('registrations')
          .select('player_id, player_name, rank, user_email');

        const playerUuidMap = {};
        allPlayers?.forEach(p => {
          if (p.player_id) {
            playerUuidMap[p.player_id] = { name: p.player_name, rank: p.rank, email: p.user_email };
          }
        });

        // 4. 获取比赛记录
        const { data: matches, error: fetchError } = await supabase
          .from('user_matches')
          .select('*, ogs_link, player_ogs_username') 
          .or(`player_id.eq.${uid},opponent_id.eq.${uid}`)
          .order('round_name', { ascending: true });

        if (fetchError) throw fetchError;

        // 5. 数据富化
        const enrichedMatches = matches?.map(item => ({
          ...item,
          player_info: playerUuidMap[item.player_id] || null,
          opponent_info: playerUuidMap[item.opponent_id] || null
        })) || [];

        // 6. 分流状态管理
        setNextMatches(enrichedMatches.filter(m => !m.result || m.result === 'Null'));
        setHistoryMatches(enrichedMatches.filter(m => m.result && m.result !== 'Null'));

        // 📡 7. 【核心新增】订阅 Supabase Realtime，监听比赛对局链接的实时变更
        const matchSubscription = supabase
          .channel('user-matches-realtime-channel')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'user_matches' // 盯着对局表
            },
            (payload) => {
              const updatedMatch = payload.new;
              
              // 💡 如果更新的这场比赛跟当前登录用户有关
              if (updatedMatch.player_id === uid || updatedMatch.opponent_id === uid) {
                console.log("🎮 Realtime Match Update Detected!", updatedMatch);
                
                // 富化更新的那单条对局数据
                const enrichedUpdatedItem = {
                  ...updatedMatch,
                  player_info: playerUuidMap[updatedMatch.player_id] || null,
                  opponent_info: playerUuidMap[updatedMatch.opponent_id] || null
                };

                // 分流同步更新：检查是未完赛还是已完赛
                const isFinished = updatedMatch.result && updatedMatch.result !== 'Null';

                if (!isFinished) {
                  // 更新未完成比赛列表
                  setNextMatches(prev => 
                    prev.map(m => m.id === updatedMatch.id ? enrichedUpdatedItem : m)
                  );
                } else {
                  // 如果直接出了结果，从 Next 移除并加入 History
                  setNextMatches(prev => prev.filter(m => m.id !== updatedMatch.id));
                  setHistoryMatches(prev => {
                    const exists = prev.some(m => m.id === updatedMatch.id);
                    if (exists) {
                      return prev.map(m => m.id === updatedMatch.id ? enrichedUpdatedItem : m);
                    }
                    return [...prev, enrichedUpdatedItem];
                  });
                }
              }
            }
          )
          .subscribe();

        // 组件卸载或重新执行时清除订阅，释放内存
        return () => {
          supabase.removeChannel(matchSubscription);
        };

      } catch (err) {
        console.error("❌ 数据加载失败:", err.message);
      } finally {
        setLoading(false);
      }
    }

    getMyMatchesData();
  }, []);

  useEffect(() => {
    const handleOgsCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        console.log("🛡️ [安全通信] 正在通过本地凭证向 Edge Function 发起 OGS 令牌安全校验...");
        
        try {
          // 🔑【核心修复】先从前端捞出当前选手的最新本地登录 Session
          const { data: { session } } = await supabase.auth.getSession();
          
          const { data, error } = await supabase.functions.invoke('ogs-oauth', {
            body: { 
              code: code,
              redirect_uri: window.location.origin
            },
            // 🚀【关键一步】把 Access Token 挂载在 headers 传过去，彻底解锁后端的 user.id！
            headers: {
              Authorization: `Bearer ${session?.access_token}`
            }
          });

          if (error) throw error;

          alert(`🎉 授权绑定成功！OGS 账号 [${data.ogs_username}] 已锁定至您的账号档案！`);
          
          window.history.replaceState({}, document.title, window.location.origin + "/#/yourMatches");
          
          // 💡 强迫页面重新加载最新绑定的数据
          window.location.reload();

        } catch (err) {
          console.error("❌ OGS 绑定失败:", err.message);
          alert(`绑定失败: ${err.message}`);
        }
      }
    };

    handleOgsCallback();
  }, []);

  // ==============================================================
  // ⚔️【新功能落地：一键自动创建对局核心逻辑】
  // ==============================================================

  // 1. 呼叫 OGS 官方底层创建比赛房间的接口
  const createOgsGame = async (playerAccessToken, opponentUsername, playerColor = 'black') => {
    try {
      const response = await fetch('https://online-go.com/api/v1/games', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${playerAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "Jiayi Go Tournament Match",
          rules: "japanese",      // 日本规则
          handicap: 0,           // 分先
          size: 19,              // 19x19 棋盘
          time_control: {
            system: "byoyomi",   // 读秒制
            main_time: 1200,     // 主时 20 分钟
            period_time: 30,     // 30 秒读秒
            periods: 3           // 3 次读秒
          },
          private: true,         // 私密对局
          ranked: false,         // 不算天梯分
          player_color: playerColor, // 发起者的颜色
          challenge_user: opponentUsername // 发起挑战对手的 OGS 真实用户名
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OGS 房间创建失败: ${response.status} - ${errText}`);
      }

      const gameData = await response.json();
      return gameData.id; 
    } catch (error) {
      console.error("❌ 自动创建 OGS 对局失败:", error.message);
      throw error;
    }
  };

  // 2. 一键建房总调度中心
  const handleAutoCreateGame = async (matchItem) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 动态去 profiles 捞出当前用户的 OGS Token 资料
      const { data: profile } = await supabase
        .from('profiles')
        .select('ogs_access_token, ogs_username')
        .eq('id', session?.user?.id)
        .single();

      if (!profile?.ogs_access_token) {
        alert("请先完成 OGS 账号授权绑定！");
        return;
      }

      // 判定谁是当前用户，谁是对手，确保精准拉出对手绑定的 OGS 用户名
      const isCurrentUserPlayer = matchItem.player_id === session?.user?.id;
      const opponentOgsName = isCurrentUserPlayer 
        ? matchItem.opponent_info?.ogs_username 
        : matchItem.player_info?.ogs_username;

      if (!opponentOgsName) {
        alert("无法自动创建：对手尚未绑定 OGS 账号！");
        return;
      }

      const myColor = isCurrentUserPlayer ? 'black' : 'white';

      alert("正在为您在 OGS 官方自动创建专属对局房间，请稍候...");
      const gameId = await createOgsGame(profile.ogs_access_token, opponentOgsName, myColor);

      if (gameId) {
        const ogsMatchUrl = `https://online-go.com/game/${gameId}`;

        // 将生成的链接一键写回当前这场比赛的 user_matches 档案记录中
        const { error: updateError } = await supabase
          .from('user_matches')
          .update({ ogs_link: ogsMatchUrl })
          .eq('id', matchItem.id);

        if (updateError) throw updateError;

        // 打开新窗口直奔战场
        window.open(ogsMatchUrl, '_blank');
      }
    } catch (error) {
      console.error("自动对局一键初始化失败:", error);
      alert(`创建对局失败: ${error.message}`);
    }
  };

  // ==============================================================
  // 【新功能落地结束】
  // ==============================================================
  
  if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>⏳ Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h2>🏆 Your Matches</h2>

      {/* NEXT MATCH 区域 */}
      <div>
        <h3>NEXT MATCH</h3>
        {nextMatches.length > 0 ? nextMatches.map(item => (
          <MatchRoom 
            key={item.id} 
            match={item} 
            currentUserName={currentUserName}
            // 🚀【核心传参】把大招一键传递给子组件卡片触发！
            onInitiateGame={() => handleAutoCreateGame(item)}
          />
        )) : <p style={{ color: '#666' }}>No upcoming matches scheduled.</p>}
      </div>

      {/* HISTORY 区域 */}
      <div>
        <h3 style={{ marginTop: '40px' }}>HISTORY</h3>
        {historyMatches.length > 0 ? historyMatches.map(item => (
          <MatchRoom 
            key={item.id} 
            match={item} 
            currentUserName={currentUserName}
          />
        )) : <p style={{ color: '#666' }}>No match history found.</p>}
      </div>
    </div>
  );
}