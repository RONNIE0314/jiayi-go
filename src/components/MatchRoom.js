import React from 'react';

/**
 * 💡 工具函数：获取赛区选手的简写，用于对阵矩阵表头或标签展示
 * 例如: "Jia CHEN" -> "JC", "Bing Fan" -> "BF"
 */
const getShortName = (name) => {
  if (!name) return '??';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export function MatchRoom({ match }) { //
  // 安全处理：防止 match 对象未传或为空时前端崩溃
  if (!match) {
    return <div style={{ padding: '10px', color: '#888' }}>暂无对局数据</div>;
  }

  // 1. 获取对手的名字缩写（如 "BF"）
  const opponentShort = getShortName(match.opponent_name); //

  // 2. 根据你的业务需求，动态渲染具体的跳转链接，如果没有就用默认的 OGS 链接
  const gameLink = match.ogs_link || "#"; //

  return (
    <div style={{ 
      padding: '15px', 
      border: '1px solid #e0e0e0', 
      borderRadius: '8px', 
      marginBottom: '10px',
      backgroundColor: '#fff'
    }}>
      {/* 选手基本信息展示区 */}
      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontWeight: '800', fontSize: '1.1em', color: '#333' }}>
          {/* 显示对手名字以及括号里的缩写标签 */}
          {match.opponent_name || "未知选手"} ({opponentShort}) 
        </span>
        
        {/* 展示对手的围棋段位（如 4D） */}
        <span style={{ 
          marginLeft: '8px', 
          padding: '2px 6px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '4px',
          fontSize: '0.85em',
          color: '#666'
        }}>
          {match.opponent_rank || "暂无段位"} 
        </span>
      </div>

      {/* 详情与邮箱区 */}
      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
        <div>📧 联络邮箱: {match.opponent_email || "未绑定邮箱"}</div> {/* */}
        <div>📅 比赛时间: {match.match_time ? new Date(match.match_time).toLocaleString() : "待定"}</div> {/* */}
        <div>🏆 当前状态: {match.result === "WIN" ? "🟢 胜局" : match.result === "LOSS" ? "🔴 负局" : "⏳ 进行中"}</div> {/* */}
      </div>

      {/* 🟢 绿色动作按钮区 */}
      <div>
        <a
          href={gameLink} //
          target="_blank" //
          rel="noreferrer" //
          style={{ //
            backgroundColor: '#22c55e', // 保持你最喜欢的绿色
            color: '#ffffff', //
            padding: '10px 20px', //
            borderRadius: '8px', //
            textDecoration: 'none', //
            fontWeight: 'bold', //
            fontSize: '0.9em', //
            display: 'inline-block' //
          }}
        >
          ✅ Let's Play! {/* */}
        </a>
      </div>
    </div>
  );
}