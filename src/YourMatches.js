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

        // 4. 获取比赛记录 (确保包含 ogs_link 和 player_ogs_username)
// 修改 YourMatches.js 中的第 53-56 行
const { data: matches, error: fetchError } = await supabase
  .from('user_matches')
  .select('*, ogs_link, player_ogs_username') // 显式请求，不要只用 *
  .or(`player_id.eq.${uid},opponent_id.eq.${uid}`)
  .order('round_name', { ascending: true })
  .setHeader('Cache-Control', 'no-cache'); // 强制不使用缓存

        if (fetchError) throw fetchError;

        // 5. 数据富化
        const enrichedMatches = matches?.map(item => ({
          ...item,
          player_info: playerUuidMap[item.player_id] || null,
          opponent_info: playerUuidMap[item.opponent_id] || null
        })) || [];

        // 6. 分流
        setNextMatches(enrichedMatches.filter(m => !m.result || m.result === 'Null'));
        setHistoryMatches(enrichedMatches.filter(m => m.result && m.result !== 'Null'));

      } catch (err) {
        console.error("❌ 数据加载失败:", err.message);
      } finally {
        setLoading(false);
      }
    }

    getMyMatchesData();
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
        )) : <p style={{ color: '#666' }}>暂无待进行的对局</p>}
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
        )) : <p style={{ color: '#666' }}>暂无历史记录</p>}
      </div>
    </div>
  );
}