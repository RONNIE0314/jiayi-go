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
        console.log("🎯 检测到 OGS 授权码，开始向安全中转站换取 Token:", code);
        
        try {
          const { data, error } = await supabase.functions.invoke('ogs-oauth', {
            body: { 
              code: code,
              redirect_uri: window.location.origin
            }
          });

          if (error) throw error;

          alert(`🎉 授权绑定成功！OGS 账号 [${data.ogs_username}] 已锁定至您的账号档案！`);
          window.history.replaceState({}, document.title, window.location.origin + "/#/yourMatches");
          
        } catch (err) {
          console.error("❌ OGS 绑定失败:", err.message);
          alert(`绑定失败: ${err.message}`);
        }
      }
    };

    handleOgsCallback();
  }, []);
  
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
          />
        )) : <p style={{ color: '#666' }}>No upcoming matches scheduled.</p>}
      </div>

      {/* HISTORY 区域 */}
      <div style={{ marginTop: '40px' }}>
        <h3>HISTORY</h3>
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