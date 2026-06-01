import React, { useState } from 'react';

export function MatchRoom({ match, currentUserName }) {
  const [showModal, setShowModal] = useState(false);

  if (!match) return null;

  // 1. 跳转逻辑
  const executeJump = () => {
    if (match.ogs_link) {
      window.open(match.ogs_link, '_blank', 'noopener,noreferrer');
      setShowModal(false);
    }
  };

  // 2. 格式化结果显示（统一转为大写判断，避免数据源大小写不一致问题）
  const result = match.result ? String(match.result).toUpperCase() : null;
  const isFinished = result === 'WIN' || result === 'LOSS';

  return (
    <>
      <div style={{ 
        background: '#48667e', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px', 
        padding: '16px 24px', 
        marginBottom: '12px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>{match.round_name}</div>
          <div style={{ fontSize: '0.95em', color: '#334155' }}>VS {match.opponent_name || '未知对手'}</div>
        </div>

        <div style={{ fontSize: '0.9em', color: '#475569' }}>
          {match.match_time || '时间待定'}
        </div>

        <div>
          {isFinished ? (
            // 显示胜负结果
            <div style={{ 
              padding: '8px 20px', 
              background: result === 'WIN' ? '#d0e3ce' : '#c7d8cd',
              color: result === 'WIN' ? '#16a34a' : '#e11d48',
              borderRadius: '6px',
              fontWeight: 'bold',
              textAlign: 'center',
              minWidth: '80px',
              border: `1px solid ${result === 'WIN' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {result === 'WIN' ? 'Win' : 'Loss'}
            </div>
          ) : (
            // 显示跳转按钮
            <button 
              onClick={() => setShowModal(true)}
              style={{ 
                padding: '8px 20px', 
                background: match.ogs_link ? '#f0fdf4' : '#f1f5f9',
                color: match.ogs_link ? '#16a34a' : '#64748b',
                border: `1px solid ${match.ogs_link ? '#bbf7d0' : '#cbd5e1'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {match.ogs_link ? '✅ Let\'s Play!' : '等待链接'}
            </button>
          )}
        </div>
      </div>

      {/* 确认登录模态框 */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#754444', padding: '25px', borderRadius: '12px', width: '350px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>确认身份与登录</h3>
            <p style={{ fontSize: '0.9em', color: '#475569' }}>当前身份：<strong>{currentUserName || '未知'}</strong></p>
            <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '20px' }}>请确保在另一个标签页登录了对应的 OGS 账号。</p>
            
            <a href="https://online-go.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '20px', color: '#3b82f6', fontSize: '0.85em' }}>
              👉 点击检查 OGS 登录状态
            </a>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>取消</button>
              <button onClick={executeJump} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>进入对局</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}