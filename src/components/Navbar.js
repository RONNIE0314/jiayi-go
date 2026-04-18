import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Navbar({ user, handleLogin, handleLogout, activeTab, setActiveTab }) {
  const navigate = useNavigate();

  // 1. 统一处理退出逻辑
  const onSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('退出失败:', error.message);
    } else {
      handleLogout(); // 清除父组件状态
      navigate('/events'); // 登出后强制跳回首页
    }
  };

  // 2. 核心逻辑：动态生成菜单数组
  // 只有当 user 存在且有 id 时，'you' 才会进入数组
  const tabs = ['events', 'players'];
  if (user && user.id) {
    tabs.push('you');
  }

  // 3. 点击菜单时的跳转逻辑
  const handleTabClick = (t) => {
    setActiveTab(t);
    navigate(`/${t}`);
  };

  // --- 样式定义 (保持你之前的风格) ---
  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 40px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  };

  const tabStyle = {
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: '500',
    color: '#555',
    textTransform: 'uppercase',
    padding: '5px 0',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s'
  };

  const activeTabStyle = {
    ...tabStyle,
    color: '#e61d2b',
    borderBottom: '2px solid #e61d2b'
  };

  const loginBtnStyle = {
    padding: '8px 20px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: user ? '#555' : '#e61d2b',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  };

  return (
    <nav style={navStyle}>
      {/* 品牌 Logo */}
      <div 
        style={{ fontWeight: 'bold', color: '#e61d2b', fontSize: '1.4em', cursor: 'pointer' }}
        onClick={() => navigate('/events')}
      >
        JIAYI GO
      </div>
      
      {/* 动态导航区域 */}
      <div style={{ display: 'flex', gap: '30px' }}>
        {tabs.map(t => (
          <span 
            key={t} 
            style={activeTab === t ? activeTabStyle : tabStyle} 
            onClick={() => handleTabClick(t)}
          >
            {t}
          </span>
        ))}
      </div>

      {/* 登录/登出按钮 */}
      <button 
        style={loginBtnStyle} 
        onMouseOver={(e) => e.target.style.opacity = 0.8}
        onMouseOut={(e) => e.target.style.opacity = 1}
        onClick={user ? onSignOut : handleLogin}
      >
        {user ? 'SIGN OUT' : 'SIGN IN'}
      </button>
    </nav>
  );
}

export default Navbar;