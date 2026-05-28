import React from 'react';

export function MatchRoom({ match }) {
  // 调试信息：确保你能看到每个 match 的 ogs_url 到底是什么
  console.log("正在渲染 match 对象:", match);

  if (!match) return null;

  // 1. 获取 URL
  const gameLink = match.ogs_url;

  return (
    <div style={{
      display: 'flex', 
      alignItems: 'center', 
      backgroundColor: '#ffffff', 
      padding: '16px 20px', 
      borderRadius: '12px', 
      border: '1px solid #e2e8f0', 
      marginBottom: '12px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* 轮次 */}
      <div style={{ marginRight: '20px', color: '#64748b', fontWeight: 'bold' }}>
        {match.round_name || 'R1'}
      </div>

      {/* 名字显示区 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontWeight: '800', fontSize: '1.1em', color: '#000000' }}>
          {match.player_name || "未知玩家"}
        </span>
        <span style={{ backgroundColor: '#334155', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7em' }}>
          VS
        </span>
        <span style={{ fontWeight: '800', fontSize: '1.1em', color: '#000000' }}>
          {match.opponent_name || "未知对手"}
        </span>
      </div>

      {/* 绿色按钮区 */}
      <div>
        <a 
          href={gameLink || "#"} 
          target="_blank" 
          rel="noreferrer" 
          style={{
            backgroundColor: '#22c55e', // 保持绿色
            color: '#ffffff', 
            padding: '10px 20px', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: 'bold', 
            fontSize: '0.9em',
            display: 'inline-block'
          }}
        >
          ✅ Let's Play!
        </a>
      </div>
    </div>
  );
}