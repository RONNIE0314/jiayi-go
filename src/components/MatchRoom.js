import React, { useState } from 'react';
// 💡 1. 引入 supabase 客户端实例（请根据你项目实际的相对路径调整，比如 ../supabaseClient）
import { supabase } from '../supabaseClient'; 

export function MatchRoom({ match, currentUserName }) {
  const [showModal, setShowModal] = useState(false);

  if (!match) return null;

  // 🏆 2. 跳转与半自动引导建房的核心异步逻辑
  const executeJump = async () => {
    try {
      // 🕵️‍♂️ 安全防御：拦截检查 match.id 是否存在
      if (!match || !match.id) {
        alert("❌ Error: match.id is missing in frontend component.");
        return;
      }

      console.log("🔍 Fetching latest match status for ID:", match.id);

      // 📡 步骤 A：实时去 user_matches 表查询最新真实状态
      const { data: latestMatch, error } = await supabase
        .from('user_matches') 
        .select('*') 
        .eq('id', String(match.id).trim()) // 👈 强转 String，完美对齐你的文本主键（如 R1_M001）
        .maybeSingle();

      if (error) {
        alert(`❌ Supabase Fetch Error: ${error.message}`);
        return;
      }

      if (!latestMatch) {
        alert(`❌ Database Desync: Cannot find any row in 'user_matches' where id = "${match.id}"`);
        return;
      }

      // 🍏 情况一：如果对手或者自己之前已经建好了房间并贴了进来
      if (latestMatch.ogs_link) {
        window.open(latestMatch.ogs_link, '_blank', 'noopener,noreferrer');
        setShowModal(false);
        return;
      }

      // 🍎 情况二：ogs_link 为空，说明你是第一个进入的选手，执行半自动建房指引
      alert(
        `👋 You are the first to enter this match room!\n\n` +
        `Please create a custom game on OGS with your opponent.\n` +
        `After creating the game, copy the URL and paste it in the next step.`
      );

      // 快捷新开页面帮选手打开 OGS 自定义对局创建页
      window.open("https://online-go.com/play", '_blank', 'noopener,noreferrer');

      // 弹出 prompt 框等待选手把建好的棋盘链接粘贴回来
      const pastedUrl = window.prompt("Paste your created OGS Match URL here (e.g., https://online-go.com/game/xxxxxx):");
      
      if (!pastedUrl || !pastedUrl.trim() || !pastedUrl.includes("online-go.com")) {
        alert("❌ Cancelled: Invalid or empty OGS URL.");
        return;
      }

      const cleanUrl = pastedUrl.trim();

      // 💾 步骤 B：将粘贴的网址写回 user_matches 表，瞬间激活同步
      const { error: updateError } = await supabase
        .from('user_matches')
        .update({ ogs_link: cleanUrl })
        .eq('id', String(match.id).trim());

      if (updateError) {
        alert(`❌ Database Sync Error: ${updateError.message}`);
        return;
      }

      alert("🎉 Match link synced successfully! Loading your game...");
      setShowModal(false);
      window.open(cleanUrl, '_blank', 'noopener,noreferrer'); // 自己也跳入棋盘

    } catch (err) {
      console.error("Critical Exception inside executeJump:", err);
      alert(`Catch Block Triggered: ${err.message}`);
    }
  };

  // 3. 格式化结果显示（统一转为大写判断，避免数据源大小写不一致问题）
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
              {/* 💡 3. 完美重构国际化文本：'等待链接' -> 'Awaiting Link' */}
              {match.ogs_link ? '✅ Let\'s Play!' : 'Awaiting Link'}
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
              {/* 💡 4. 这里的 onClick 执行我们重构后的高级异步处理逻辑 */}
              <button onClick={executeJump} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>进入对局</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}