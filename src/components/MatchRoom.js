import React from 'react';

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
  if (!match) {
    return <div style={{ padding: '10px', color: '#888' }}>暂无对局数据</div>;
  }

  // ==================== 🎯 真正完美的动态主视角判定 ====================
  // 1. 无论是 UUID 匹配上了 player_id，还是名字字符串对上了，都说明“我”是 Player A
  const isPlayerA = 
    (currentUserId && match.player_id === currentUserId) || 
    (currentUserName && match.player_name?.toLowerCase() === currentUserName?.toLowerCase());

  // 2. 根据我到底是不是 Player A，精确抓取“对手”的外联扩展信息 (来自关联的 registrations 表)
  const opponentInfo = isPlayerA ? match.opponent_info : match.player_info;

  // 3. 动态提取对手名字：优先用外联表的真实姓名，其次用 user_matches 表里的冗余字段，都没有则显示未知
  const opponentName = isPlayerA 
    ? (match.opponent_name || opponentInfo?.player_name || 'Unknown Player') 
    : (match.player_name || opponentInfo?.player_name || 'Unknown Player');

  // 4. 动态提取对手的段位 (Rank)
  const opponentRank = isPlayerA 
    ? (opponentInfo?.rank || match.opponent_rank || '暂无段位') 
    : (match.player_info?.rank || match.player_rank || '暂无段位');

  // 5. 动态提取对手的联系邮箱
  const opponentEmail = isPlayerA 
    ? (opponentInfo?.user_email || match.opponent_email || '未绑定邮箱') 
    : (match.player_info?.user_email || match.player_email || '未绑定邮箱');

  // 6. 获取对手名字的缩写前两个字母
  const opponentShort = getShortName(opponentName);

  // ==================== 🏆 动态处理胜负状态转换 ====================
  let displayResult = "⏳ 进行中";
  let isFinished = false;

  if (match.result && match.result !== 'Null') {
    const resUpper = match.result.toUpperCase();
    isFinished = true;
    
    if (resUpper === 'WIN') {
      // 如果结果是 WIN，且我是 Player A，说明我赢了；否则说明 Player A 赢了（我作为 Player B 输了）
      displayResult = isPlayerA ? "🟢 胜局 (WIN)" : "🔴 负局 (LOSS)";
    } else if (resUpper === 'LOSS') {
      // 如果结果是 LOSS，且我是 Player A，说明我输了；否则说明我作为 Player B 赢了
      displayResult = isPlayerA ? "🔴 负局 (LOSS)" : "🟢 胜局 (WIN)";
    }
  }

  // ==================== 🎨 样式定义 ====================
  const cardStyle = {
    background: 'rgba(30, 41, 59, 0.7)', // 深色半透明背景，完美贴合星空/黄昏
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
    background: isFinished && displayResult.includes('负局') ? '#4b5563' : '#3b82f6', // 输了变灰，进行中/赢了是蓝色
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
    gap: '10px'
  };

  const resultBadgeStyle = {
    fontSize: '0.9em',
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '20px',
    background: displayResult.includes('胜局') ? 'rgba(34, 197, 94, 0.2)' : 
                displayResult.includes('负局') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
    color: displayResult.includes('胜局') ? '#4ade80' : 
           displayResult.includes('负局') ? '#f87171' : '#facc15',
    border: displayResult.includes('胜局') ? '1px solid rgba(34, 197, 94, 0.4)' : 
            displayResult.includes('负局') ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(234, 179, 8, 0.4)'
  };

  const ogsButtonStyle = {
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    background: '#2563eb',
    color: '#white',
    cursor: 'pointer',
    fontSize: '0.85em',
    fontWeight: '600',
    transition: 'background 0.2s',
    textDecoration: 'none',
    display: 'inline-block'
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

      {/* 👉 右侧区域：当前视角下的比赛状态与 OGS 实时对局观战按钮 */}
      <div style={rightZoneStyle}>
        <div style={resultBadgeStyle}>{displayResult}</div>
        
        {match.ogs_link ? (
          <a 
            href={match.ogs_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={ogsButtonStyle}
            onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.background = '#2563eb'}
          >
            进入 OGS 对局 🚀
          </a>
        ) : (
          <span style={{ fontSize: '0.85em', color: '#64748b', fontStyle: 'italic' }}>暂未绑定房间</span>
        )}
      </div>
    </div>
  );
}