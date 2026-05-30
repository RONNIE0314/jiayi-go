import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // 💡 确认你的 Supabase 客户端路径

export function AdminMatchBinder() {
  const [activeMatches, setActiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  
  // 用来存储每个对局输入框里的临时文本，格式为 { [matchId]: 'token_or_url' }
  const [inputValues, setInputValues] = useState({});

  // 1. 组件加载时，把所有未完赛的对局捞出来
  useEffect(() => {
    fetchActiveMatches();
  }, []);

  async function fetchActiveMatches() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_matches')
        .select('id, round_name, player_name, opponent_name, ogs_link')
        .or('result.is.null,result.eq.Null,result.eq.') // 只捞进行中/未完赛的
        .order('round_name', { ascending: true });

      if (error) throw error;
      setActiveMatches(data || []);

      // 初始化输入框的默认值（如果数据库里已经有链接，先推入显示）
      const initialInputs = {};
      data?.forEach(m => {
        initialInputs[m.id] = m.ogs_link || '';
      });
      setInputValues(initialInputs);
    } catch (err) {
      console.error('❌ 拉取待绑定对局失败:', err.message);
    } finally {
      setLoading(false);
    }
  }

  // 2. 核心：一键绑定保存函数
  async function handleBindLink(matchId) {
    const rawValue = inputValues[matchId]?.trim();
    
    if (!rawValue) {
      alert('请先输入 OGS 邀请链接或 Token 再保存！');
      return;
    }

    try {
      setSubmittingId(matchId);

      // 直接把管理员输入的原始文本（不管是全称URL还是3qZdj...这样的Token）更新进 Supabase
      const { error } = await supabase
        .from('user_matches')
        .update({ ogs_link: rawValue })
        .eq('id', matchId);

      if (error) throw error;

      alert('🎉 OGS 房间/邀请链接一键绑定成功！选手端已同步刷新。');
      
      // 局部更新状态，让界面不用整页刷新
      setActiveMatches(prev => 
        prev.map(m => m.id === matchId ? { ...m, ogs_link: rawValue } : m)
      );
    } catch (err) {
      alert(`❌ 绑定失败: ${err.message}`);
    } finally {
      setSubmittingId(null);
    }
  }

  // 3. 输入框高频联动变动处理
  const handleInputChange = (matchId, value) => {
    setInputValues(prev => ({
      ...prev,
      [matchId]: value
    }));
  };

  if (loading) {
    return <div style={{ color: '#aaa', padding: '20px', textAlign: 'center' }}>⚙️ 正在加载未绑定赛事列表...</div>;
  }

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', maxWidth: '900px', margin: '20px auto' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3em', display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
        🔗 OGS 邀请链接 / Token 快捷绑定面板
      </h3>

      {activeMatches.length === 0 ? (
        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>当前暂无正在进行（待绑定）的对局记录。</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeMatches.map((match) => (
            <div 
              key={match.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'rgba(30, 41, 59, 0.8)', 
                padding: '15px 20px', 
                borderRadius: '10px', 
                border: '1px solid rgba(255,255,255,0.05)',
                flexWrap: 'wrap',
                gap: '15px'
              }}
            >
              {/* 左侧：比赛基本选手信息 */}
              <div style={{ flex: '1', minWidth: '250px' }}>
                <span style={{ fontSize: '0.8em', background: '#1e293b', color: '#94a3b8', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>
                  {match.round_name || '未命名轮次'}
                </span>
                <strong style={{ color: '#f8fafc', fontSize: '1.05em' }}>
                  {match.player_name || '未知'} <span style={{ color: '#38bdf8' }}>vs</span> {match.opponent_name || '未知'}
                </strong>
                {match.ogs_link && (
                  <div style={{ fontSize: '0.75em', color: '#10b981', marginTop: '4px' }}>
                    现存数据: {match.ogs_link.length > 20 ? `${match.ogs_link.slice(0, 20)}...` : match.ogs_link}
                  </div>
                )}
              </div>

              {/* 右侧：交互输入框与一键保存按钮 */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1.5', minWidth: '300px' }}>
                <input
                  type="text"
                  placeholder="粘贴 OGS 完整邀请链接 或 纯 Token（如: 3qZdj8L...）"
                  value={inputValues[match.id] || ''}
                  onChange={(e) => handleInputChange(match.id, e.target.value)}
                  style={{
                    flex: '1',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    background: '#0f172a',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                  onBlur={(e) => e.target.style.borderColor = '#475569'}
                />
                
                <button
                  onClick={() => handleBindLink(match.id)}
                  disabled={submittingId === match.id}
                  style={{
                    padding: '8px 16px',
                    background: submittingId === match.id ? '#64748b' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: submittingId === match.id ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem',
                    transition: 'background 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => { if(submittingId !== match.id) e.target.style.background = '#059669'; }}
                  onMouseLeave={(e) => { if(submittingId !== match.id) e.target.style.background = '#10b981'; }}
                >
                  {submittingId === match.id ? '提交中...' : '一键绑定 🔗'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}