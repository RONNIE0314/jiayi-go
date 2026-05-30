import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';      
import { MatchRoom } from './components/MatchRoom'; 

export default function YourMatches() {
  const [nextMatches, setNextMatches] = useState([]);
  const [historyMatches, setHistoryMatches] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getMyMatchesData() {
      try {
        setLoading(true);

        // 1. 获取当前登录用户的 Auth 信息
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.log("❌【YourMatches】用户未登录");
          setLoading(false);
          return;
        }

        const uid = user.id;
        setCurrentUserId(uid);

        // 2. 捞出当前登录用户的真实名字
        const { data: regData } = await supabase
          .from('registrations')
          .select('player_name')
          .eq('user_id', uid)
          .maybeSingle();

        const detectedName = regData?.player_name || '';
        setCurrentUserName(detectedName);

        // 3. 捞出全员的“UUID -> 详细信息”注册花名册
        const { data: allPlayers } = await supabase
          .from('registrations')
          .select('player_id, player_name, rank, user_email');

        // 转成方便快速查找的 Map 字典
        const playerUuidMap = {};
        if (allPlayers) {
          allPlayers.forEach(p => {
            if (p.player_id) {
              playerUuidMap[p.player_id] = {
                name: p.player_name,
                rank: p.rank,
                email: p.user_email
              };
            }
          });
        }

        // 4. 单表查询 user_matches（100% 绕过关联缓存报错）
        let orCondition = `player_id.eq.${uid},opponent_id.eq.${uid}`;
        if (detectedName) {
          orCondition += `,player_name.eq.${detectedName},opponent_name.eq.${detectedName}`;
        }

        const { data: matches, error: fetchError } = await supabase
          .from('user_matches')
          .select('id, round_name, result, match_time, player_id, opponent_id, player_name, opponent_name, ogs_link')
          .or(orCondition)
          .order('round_name', { ascending: true });

        if (fetchError) throw fetchError;

        console.log("📊【YourMatches】成功拉取对局数据:", matches);

        // 5. 🎯【UUID 强锁定拼接】：完全基于清洗后的 ID 链条自动咬合段位和邮箱
        const enrichedMatches = matches?.map(item => {
          const pInfo = playerUuidMap[item.player_id];
          const oInfo = playerUuidMap[item.opponent_id];

          return {
            ...item,
            // 保持 user_matches 表内原始录入的名字（JIAYI_Admin / BING FAN）
            player_name: item.player_name,
            opponent_name: item.opponent_name,
            
            // 手工灌注模拟出来的外键结构，供 MatchRoom 组件无缝读取
            player_info: pInfo ? {
              player_name: pInfo.name,
              rank: pInfo.rank,
              user_email: pInfo.email
            } : null,
            
            opponent_info: oInfo ? {
              player_name: oInfo.name,
              rank: oInfo.rank,
              user_email: oInfo.email
            } : null
          };
        }) || [];

        // 6. 数据分流：处理历史与未来的比赛记录
        const nextList = [];
        const historyList = [];

        enrichedMatches.forEach(item => {
          if (item.result === null || item.result === 'Null' || item.result === '') {
            nextList.push(item);
          } else {
            historyList.push(item);
          }
        });

        setNextMatches(nextList);
        setHistoryMatches(historyList);

      } catch (err) {
        console.error("❌【YourMatches】组件加载数据失败:", err.message);
      } finally {
        setLoading(false);
      }
    }

    getMyMatchesData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', color: '#fff', textAlign: 'center', fontSize: '1.1em' }}>
        ⏳ Loading your tournament records...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5em', marginBottom: '30px', fontWeight: 'bold' }}>
        🏆 Your Matches
      </h2>

      {/* ---------------- NEXT MATCH 区域 ---------------- */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '1.1em', color: '#38bdf8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', letterSpacing: '1px' }}>
          NEXT MATCH
        </h3>
        <div style={{ marginTop: '15px' }}>
          {nextMatches.length > 0 ? (
            nextMatches.map(item => (
              <MatchRoom 
                key={item.id} 
                match={item} 
                currentUserId={currentUserId}
                currentUserName={currentUserName}
              />
            ))
          ) : (
            <p style={{ color: '#aaa', fontSize: '0.95em', fontStyle: 'italic', padding: '10px 0' }}>暂无待进行的对局</p>
          )}
        </div>
      </div>

      {/* ---------------- HISTORY 区域 ---------------- */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '1.1em', color: '#9ca3af', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', letterSpacing: '1px' }}>
          HISTORY
        </h3>
        <div style={{ marginTop: '15px' }}>
          {historyMatches.length > 0 ? (
            historyMatches.map(item => (
              <MatchRoom 
                key={item.id} 
                match={item} 
                currentUserId={currentUserId}
                currentUserName={currentUserName}
              />
            ))
          ) : (
            <p style={{ color: '#aaa', fontSize: '0.95em', fontStyle: 'italic', padding: '10px 0' }}>暂无历史对局记录</p>
          )}
        </div>
      </div>
    </div>
  );
}