import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; // 确保这里和你 App.js 里的 supabase 导入路径一致

function MatchMatrix() {
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 从数据库拉取全部对局数据
  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        const { data, error } = await supabase
          .from('user_matches')
          .select('*');

        if (error) throw error;

        if (data) {
          setMatches(data);
          
          // 提取所有参赛选手的独特名字并去重
          const allPlayerNames = new Set();
          data.forEach(m => {
            if (m.player_name) allPlayerNames.add(m.player_name);
            if (m.opponent_name) allPlayerNames.add(m.opponent_name);
          });
          
          setPlayers(Array.from(allPlayerNames));
        }
      } catch (err) {
        console.error("拉取对局矩阵失败:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatrixData();
  }, []);

  if (loading) {
    return <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>⏳ 正在生成对局矩阵...</div>;
  }

  // 2. 工具函数：根据行选手和列选手，寻找对应的比赛结果
  const getCellContent = (rowPlayer, colPlayer) => {
    // 如果是自己对自己，显示深灰色斜对角线
    if (rowPlayer === colPlayer) {
      return { text: '', bg: '#334155', color: 'transparent' }; 
    }

    const match = matches.find(
      m => m.player_name === rowPlayer && m.opponent_name === colPlayer
    );

    // 无对局数据时显示灰色的横杠
    if (!match) return { text: '-', bg: 'rgba(30, 41, 59, 0.4)', color: '#64748b' }; 

    // 赢了亮起翠绿色
    if (match.result === 'Win' || match.result === 'WIN') {
      return { text: '+', bg: 'rgba(16, 185, 129, 0.25)', color: '#34d399' };
    }
    // 输了亮起暗红色
    if (match.result === 'Loss' || match.result === 'LOSS') {
      return { text: '-', bg: 'rgba(244, 63, 94, 0.25)', color: '#f43f5e' };
    }
    
    // 待定显示中规中矩的灰色
    return { text: 'TBD', bg: 'rgba(71, 85, 105, 0.3)', color: '#94a3b8' };
  };

  // 🔮 3. 仿造你的 App.js 风格，直接统一定义原生样式对象
  const matrixContainerStyle = {
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '24px',
    backgroundColor: 'rgba(15, 23, 42, 0.88)', // 坚实的深色半透明底，彻底挡住背景图
    backdropFilter: 'blur(12px)',               // 现代毛玻璃效果
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    overflowX: 'auto',
    maxHeight: '75vh',
    overflowY: 'auto'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '15px',
    color: '#e2e8f0',
    textAlign: 'center'
  };

  const headerRowStyle = {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    fontWeight: 'bold'
  };

  const cellStyle = {
    padding: '12px 8px',
    border: '1px solid #334155',
    minWidth: '65px',
    fontWeight: '600'
  };

  // 🔒 固定在左侧的选手名字专用样式（带右侧坚实阴影，横向滚动不穿透）
  const stickyNameStyle = {
    padding: '12px 16px',
    border: '1px solid #334155',
    textAlign: 'left',
    fontWeight: 'bold',
    position: 'sticky',
    left: 0,
    zIndex: 10,
    boxShadow: '4px 0 8px rgba(0,0,0,0.4)'
  };

  return (
    <div style={matrixContainerStyle}>
      {/* 顶部标题 */}
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>
          📊 交叉对局矩阵表 
          <span style={{ fontSize: '12px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '2px 10px', borderRadius: '999px', marginLeft: '12px', fontWeight: '500' }}>
            总计 {matches.length} 场对局
          </span>
        </h2>
      </div>

      {/* 核心表格 */}
      <table style={tableStyle}>
        <thead>
          <tr style={headerRowStyle}>
            <th style={{ ...stickyNameStyle, backgroundColor: '#1e293b', color: '#f1f5f9' }}>选手名单</th>
            {players.map((p) => (
              <th key={p} style={cellStyle} title={p}>
                {p ? p.substring(0, 2).toUpperCase() : '??'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((rowPlayer) => (
            <tr key={rowPlayer} className="matrix-row-hover">
              {/* 左侧选手姓名列 */}
              <td style={{ ...stickyNameStyle, backgroundColor: '#0f172a', color: 'white' }}>
                {rowPlayer}
              </td>
              
              {/* 各自的对战结果单元格 */}
              {players.map((colPlayer) => {
                const cell = getCellContent(rowPlayer, colPlayer);
                return (
                  <td 
                    key={colPlayer} 
                    style={{ 
                      ...cellStyle, 
                      backgroundColor: cell.bg, 
                      color: cell.color,
                      fontSize: cell.text === 'TBD' ? '12px' : '18px' 
                    }}
                  >
                    {cell.text}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MatchMatrix;