import React, { useState } from 'react';

/**
 * 辅助函数：获取名字的前两个字母作为头像缩写
 */
function getShortName(name) {
  if (!name) return '??';
  return name.slice(0, 2).toUpperCase();
}

/**
 * MatchRoom 子组件
 * @param {object} match - 来自 user_matches 表的单场对局数据对象
 * @param {string} currentUserId - 当前登录用户的 UUID
 * @param {string} currentUserName - 当前登录用户的名字（例如 "MonikaL" 或 "medspare"）
 */
export function MatchRoom({ match, currentUserId, currentUserName }) {
  // 💡 引入一个局部状态，完美而安全地控制绿色按钮的悬停高亮
  const [isHovered, setIsHovered] = useState(false);

  if (!match) {
    return <div style={{ padding: '10px', color: '#888' }}>暂无对局数据</div>;
  }

  // ==================== 🎯 真正完美的动态主视角判定 ====================
  const isPlayerA = 
    (currentUserId && match.player_id === currentUserId) || 
    (currentUserName && match.player_name?.toLowerCase() === currentUserName?.toLowerCase());

  const opponentInfo = isPlayerA ? match.opponent_info : match.player_info;

  const opponentName = isPlayerA 
    ? (match.opponent_name || opponentInfo?.player_name || 'Unknown Player') 
    : (match.player_name || opponentInfo?.player_name || 'Unknown Player');

  const opponentRank = isPlayerA 
    ? (opponentInfo?.rank || match.opponent_rank || '暂无段位') 
    : (match.player_info?.rank || match.player_rank || '暂无段位');

  const opponentEmail = isPlayerA 
    ? (opponentInfo?.user_email || match.opponent_email || '未绑定邮箱') 
    : (match.player_info?.user_email || match.player_email || '未绑定邮箱');

  const opponentShort = getShortName(opponentName);

  // ==================== 🏆 动态处理胜负状态转换 ====================
  let displayResult = "⏳ 进行中";
  let isFinished = false;

  if (match.result && match.result !== 'Null' && match.result !== '') {
    const resUpper = match.result.toUpperCase();
    isFinished = true;
    
    if (resUpper === 'WIN') {
      displayResult = isPlayerA ? "🟢 胜局 (WIN)" : "🔴 负局 (LOSS)";
    } else if (resUpper === 'LOSS') {
      displayResult = isPlayerA ? "🔴 负局 (LOSS)" : "🟢 胜局 (WIN)";
    }
  }

  // ==================== 🎨 样式定义 ====================
  const cardStyle = {
    background: 'rgba(30, 41, 59, 0.7)', 
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  const leftZoneStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const avatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: isFinished && displayResult.includes('负局') ? '#4b5563' : '#3b82f6', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.1em',
    color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
  };

  const nameStyle = {
    fontSize: '1.2em',
    fontWeight: '600',
    color: '#f8fafc',
    margin: '0 0 4px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const rankBadgeStyle = {
    fontSize: '0.75em',
    background: '#1e293b',
    border: '1px solid #38bdf8',
    color: '#38bdf8',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 'normal'
  };

  const metaStyle = {
    fontSize: '0.85em',
    color: '#94a3b8',
    margin: '2px 0'
  };

  const rightZoneStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center', 
    gap: '10px'
  };

  const resultBadgeStyle = {
    fontSize: '0.9em',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '20px',
    background: displayResult.includes('胜局') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
    color: displayResult.includes('胜局') ? '#4ade80' : '#f87171',
    border: displayResult.includes('胜局') ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'
  };

  // ✅ 安全的绿色 NAGO 风格 "Let's Play!" 按钮样式
  const letsPlayButtonStyle = {
    backgroundColor: isHovered ? '#f0fdf4' : 'white', // 👈 纯 React 状态驱动悬停颜色，永不报错！
    color: '#10b981',
    border: '1px solid #10b981',
    padding: '6px 14px',
    borderRadius: '20px', 
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)',
    textDecoration: 'none',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={cardStyle}>
      {/* 👈 左侧区域：对手头像与详细基础资料 */}
      <div style={leftZoneStyle}>
        <div style={avatarStyle}>{opponentShort}</div>
        <div>
          <h4 style={nameStyle}>
            {opponentName}
            <span style={rankBadgeStyle}>{opponentRank}</span>
          </h4>
          <p style={metaStyle}>📧 {opponentEmail}</p>
          <p style={metaStyle}>📅 {match.round_name || '常规对局'} | {match.match_time ? new Date(match.match_time).toLocaleString() : '时间待定'}</p>
        </div>
      </div>

      {/* 👉 右侧区域 */}
      <div style={rightZoneStyle}>
        {isFinished ? (
          <div style={resultBadgeStyle}>{displayResult}</div>
        ) : match.ogs_link ? (
          <a 
          href={(() => {
  // 1. 如果录入的是完整链接，直接放行
  if (match.ogs_link && match.ogs_link.startsWith('http')) {
    return match.ogs_link;
  }
  
  // 2. 如果是乱码 Token，前端自动判断当前登录用户的执方颜色
  // 💡 根据组件内的变量：如果对手名字是 opponent_name，说明你当前是 player_name
  // 假设在你的 user_matches 表设计中，player_name 执黑，opponent_name 执白
  // 我们来核对当前选手的身份：
  const isOpponent = currentUserName && match.opponent_name?.toLowerCase() === currentUserName?.toLowerCase();
  const side = isOpponent ? 'white' : 'black';
  
  return `https://online-go.com/online-league/league-player?side=${side}&id=${match.ogs_link}`;
})()} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={letsPlayButtonStyle}
            onMouseEnter={() => setIsHovered(true)}  // 👈 极简的状态切换
            onMouseLeave={() => setIsHovered(false)} // 👈 极简的状态切换
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>✓</span> 
            Let's Play!
          </a>
        ) : (
          <span style={{ fontSize: '0.85em', color: '#64748b', fontStyle: 'italic' }}>暂未绑定房间</span>
        )}
      </div>
    </div>
  );
}