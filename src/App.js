import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';

// --- 1. 样式定义 (包含 YOU 页面所需的所有样式) ---
const containerStyle = { 
  width: '100%',
  minHeight: '100vh',
  color: 'white',
  position: 'relative', 
  overflowX: 'hidden', // 防止横向滚动条

  // --- 关键：锁定背景图，不让它乱跑 ---
  backgroundImage: 'url("/background.jpg")',
  backgroundSize: 'cover',        // 强制铺满，不留白
  backgroundPosition: 'center',    // 始终居中
  backgroundAttachment: 'fixed',   // 滚动时背景保持不动（非常重要！）
  backgroundRepeat: 'no-repeat',
  
  // 确保背景不会被任何 transform 影响
  transform: 'none' 
};
const navStyle = { display: 'flex', justifyContent: 'space-between', padding: '20px 60px', borderBottom: '1px solid #1e293b', alignItems: 'center' };
const contentStyle = { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' };
const headerStyle = { fontSize: '2.2em', fontWeight: 'bold', color: '#1a1a1a', textShadow: '0px 0px 5px rgba(255, 255, 255, 0.8)', marginBottom: '24px' };
const tabStyle = { color: '#000000', cursor: 'pointer', transition: '0.3s', padding: '5px 10px' };
const activeTabStyle = { color: '#000000', cursor: 'pointer', borderBottom: '2px solid #e61d2b', paddingBottom: '8px', fontWeight: 'bold' };

const listStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const cardStyle = { 
  display: 'flex', 
  // 关键 1：改为 column，让图片在上面，文字在下面，这样旋转才好看
  flexDirection: 'column', 
  backgroundColor: '#1e293b', 
  padding: '0', // 把 padding 设为 0，让图片能撑满边框
  borderRadius: '12px', 
  border: '1px solid #334155',
  overflow: 'hidden' // 关键 2：剪掉旋转后多出来的图片边缘
};
const infoStyle = { display: 'flex', gap: '24px', alignItems: 'center' };
const idStyle = { color: '#475569', fontSize: '0.9em' };
const nameStyle = { fontSize: '1.1em', fontWeight: '600' };
const rankStyle = { backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '4px 10px', borderRadius: '6px' };
const ratingStyle = { color: '#94a3b8' };
const loginBtnStyle = { backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const adminContainerStyle = {
  backgroundColor: 'rgba(30, 41, 59, 0.7)',
  padding: '30px',
  borderRadius: '16px',
  border: '1px solid #334155',
  marginTop: '20px'
};

// ADMIN & YOU 页面专属样式
const adminFormStyle = { display: 'flex', gap: '10px', marginBottom: '30px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #8b5cf6' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', flex: 1 };
const addBtnStyle = { backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const deleteBtnStyle = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8em' };
// 在 App.js 顶部定义样式
const messageContainerStyle = {
  backgroundColor: 'white',
  padding: '12px 15px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
  borderLeft: '4px solid #1e293b', // 深色左边条增加质感
  textAlign: 'left' 
};
const sectionTitleStyle = { color: '#64748b', fontSize: '0.85em', fontWeight: '800', marginBottom: '12px', marginTop: '30px' };
const nextMatchCardStyle = { display: 'flex', alignItems: 'center', backgroundColor: '#e0f2f1', padding: '24px', borderRadius: '12px', border: '1px solid #b2dfdb', position: 'relative' };
const matchInfoStyle = { flex: 1, display: 'flex', alignItems: 'center', gap: '16px' };
const playerNameStyle = { fontSize: '1.1em', color: '#1e293b', fontWeight: '500' };
const rankPillStyle = { fontSize: '0.7em', padding: '2px 8px', borderRadius: '10px', border: '1px solid #cbd5e1', marginLeft: '6px' };
const playBtnStyle = { backgroundColor: '#ffffff', color: '#22c55e', border: '1px solid #22c55e', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' };
const historyCardStyle = { display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const noResultBadgeStyle = { backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.7em', padding: '2px 8px', borderRadius: '10px' };
const blackStoneIcon = { width: '40px', height: '40px', backgroundColor: '#111', borderRadius: '50%' };
const whiteStoneIcon = { width: '40px', height: '40px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '50%' };
const roundBadgeStyle = { position: 'absolute', top: '-10px', left: '20px', backgroundColor: '#475569', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75em' };
const smallRoundBadgeStyle = { backgroundColor: '#64748b', color: 'white', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7em', marginRight: '12px' };
const matchTimeStyle = { textAlign: 'right', fontSize: '0.9em', color: '#1e293b' };
const historyTimeStyle = { color: '#64748b', fontSize: '0.85em' };
// eslint-disable-next-line
const imgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover', 
  display: 'block',
  transform: 'none' 
};


// --- 2. 页面子组件 ---
// 活动页
function EventsPage({ events, onEventClick }) {
  // 1. 定义内部样式
  const eventCardStyle = {
    backgroundColor: '#323c50',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '25px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(157, 125, 250, 0.3)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
    width: '100%',
    maxWidth: '400px',
    transition: 'transform 0.2s'
  };

  const titleStyle = { margin: '0 0 10px 0', color: '#ffffff', fontSize: '1.4rem', fontWeight: 'bold' };
  const textStyle = { color: '#d1d1d1', fontSize: '0.95rem', marginBottom: '5px' };
  const infoBoxStyle = { padding: '20px', textAlign: 'left' };
  const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };

  // 2. 渲染页面
  return (
    <div style={{ ...listStyle, position: 'relative', paddingTop: '80px' }}>
      
    {/* 🚀 放置在此：Logo 包装容器 */}
      <div className="logo-wrapper" style={{
        position: 'absolute', 
        top: '-100px',          
        left: '-120px',         
        zIndex: 100,          
      }}>
        <img 
          src="/logo.jpg" 
          alt="JIAYI GO BRAND" 
          className="main-logo"
          style={{ 
            height: '110px', width: '110px', borderRadius: '50%',
            objectFit: 'cover',
            filter: 'drop-shadow(0 4px 6px rgba(9, 5, 65, 0.21))',
            boxShadow: '0 0 10px rgba(157, 125, 250, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            transition: 'transform 0.2s'
          }} 
          onError={(e) => { e.target.style.display = 'none'; }} 
        />
      </div>

      <h1 style={headerStyle}>Upcoming Events</h1>

      {/* 3. 赛事列表 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', justifyContent: 'flex-start' }}>
        {events.map((ev) => (
          <div 
            key={ev.id} 
            style={{ ...eventCardStyle, cursor: 'pointer' }} 
            onClick={() => onEventClick(ev.id)}
          >
            {/* 卡片内部的图片（大桥） */}
            <div style={{ 
              width: '100%', 
              height: '200px', 
              overflow: 'hidden', 
              borderRadius: '12px 12px 0 0',
              backgroundColor: '#1e293b' 
            }}>
              <img 
                src="/background1.jpg" 
                alt={ev.name} 
                style={imgStyle}  // 👈 重点：确保这一行存在且拼写正确
              />
            </div>

            {/* 卡片下方的文字信息 */}
            <div style={infoBoxStyle}>
              <h3 style={titleStyle}>{ev.name}</h3>
              <div style={textStyle}>📅 {ev.date}</div>
              <div style={textStyle}>📍 {ev.location || 'TBA'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// 管理后台页
function AdminPlayersPage({ players, fetchPlayers, setActiveTab }) {
  const [newPlayer, setNewPlayer] = useState({ name: '', rank: '', rating: '' });

  const handleAdd = async () => {
    if (!newPlayer.name || !newPlayer.rank) return alert("Please fill Name and Rank");
    const { error } = await supabase.from('players').insert([{ 
      name: newPlayer.name, 
      rank: newPlayer.rank, 
      rating: parseInt(newPlayer.rating) || 0 
    }]);
    if (!error) {
      setNewPlayer({ name: '', rank: '', rating: '' });
      fetchPlayers();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this player?")) {
      const { error } = await supabase.from('players').delete().eq('id', id);
      if (!error) fetchPlayers();
    }
  };

  return (
    <div style={{ ...containerStyle,  
                  ...listStyle, 
                  position: 'relative', 
                  paddingTop: '160px',
                  display: 'block', 
                  textAlign: 'left'
                }}>
      
      {/* 🚀 放置在此：Logo 包装容器 */}
      <div className="logo-wrapper" style={{
        position: 'fixed',
        top: '20px',
        left: '60px',
        zIndex: 9999,
        width: '110px',
        height: '110px',
        margin: 0,
        pointerEvents: 'auto'
      }}>
        <img 
          src="/logo.jpg" 
          alt="JIAYI GO BRAND"
          className="main-logo" 
          style={{ 
            height: '110px', width: '110px', borderRadius: '50%',
            objectFit: 'cover', cursor: 'pointer',
            filter: 'drop-shadow(0 4px 15px rgba(9, 5, 65, 0.4))',
            boxShadow: '0 0 15px rgba(0,0,0,0.6)',
            border: '2px solid white',
            transition: 'transform 0.2s'
          }} 
          onClick={() => setActiveTab('events')} // 管理员点 Logo 回首页
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'} 
        />
      </div>

      <h1 style={{ ...headerStyle, marginTop: '10px', marginBottom: '30px' }}>
      Admin: Players Management
      </h1>

      <div style={adminFormStyle}>
        <input style={inputStyle} placeholder="Name" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} />
        <input style={inputStyle} placeholder="Rank (e.g. 1d)" value={newPlayer.rank} onChange={e => setNewPlayer({...newPlayer, rank: e.target.value})} />
        <input style={inputStyle} type="number" placeholder="Rating" value={newPlayer.rating} onChange={e => setNewPlayer({...newPlayer, rating: e.target.value})} />
        <button style={addBtnStyle} onClick={handleAdd}>ADD</button>
      </div>
      <div style={listStyle}>
        {players.map(p => (
          <div key={p.id} style={cardStyle}>
            <div style={infoStyle}>
              <span style={nameStyle}>{p.name}</span>
              <span style={rankStyle}>{p.rank}</span></div>
            <button style={deleteBtnStyle} onClick={() => handleDelete(p.id)}>DELETE</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 赛事报名流程组件 (收集信息 + 分组动画 + 结果显示) ---
function RegistrationFlow({ user, selectedEventId, events, onFinish }) {
  const [step, setStep] = useState(0); // 0: 表单, 1: 动画, 2: 结果
  const [formData, setFormData] = useState({ username: '', rank: '', rating: '', password: '' });
  
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const handleStartGrouping = async (e) => {
    e.preventDefault();
  try {
    setStep(1); // 进入动画

  const { error: insertError } = await supabase
      .from('registrations')
      .insert([{
        event_id: String(selectedEventId),
        event_title: selectedEvent?.name,
        user_id: user.id,
        user_name: formData.username,
        user_email: user.email, 
        rank: formData.rank,
        rating: formData.rating,
        ground: 0 // <--- 重点：初始值为0，代表待分配
      }]);

    if (insertError) throw insertError;

    // 2. 动画结束后直接进入“等待审核”状态
    setTimeout(() => {
      setStep(2); 
    }, 2000);

  } catch (err) {
    alert("Registration failed: " + err.message);
    setStep(0);
  }
  };

  // --- 视图渲染逻辑 ---

  // 步骤 0：填写表单
  if (step === 0) return (
    <div style={adminContainerStyle}>
      <div 
        onClick={() => onFinish()} // 点击返回直接触发完成/关闭
        style={{ cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', marginBottom: '15px', opacity: 0.8 }}
      >
        <span style={{ fontSize: '1.4em', marginRight: '8px' }}>←</span>
        <span>Back to Events</span>
      </div>
      <h2 style={{color:'white', marginBottom:'20px'}}>Tournament Entry: {selectedEvent?.name}</h2>
      <form onSubmit={handleStartGrouping} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input style={inputStyle} placeholder="Go Username" required onChange={e => setFormData({...formData, username: e.target.value})} />
        <input style={inputStyle} placeholder="Rank (e.g. 5k)" required onChange={e => setFormData({...formData, rank: e.target.value})} />
        <input style={inputStyle} placeholder="Current Rating" required onChange={e => setFormData({...formData, rating: e.target.value})} />
        <input style={{ ...inputStyle, opacity: 0.7, backgroundColor: '#1e293b' }} value={user?.email || ''} readOnly />
        <input style={inputStyle} type="password" placeholder="OGS Password (for link)" required onChange={e => setFormData({...formData, password: e.target.value})} />
        <button type="submit" style={{...addBtnStyle, marginTop:'10px'}}>Join & Start Grouping</button>
      </form>
    </div>
  );

  // 步骤 1：分组动画
  if (step === 1) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'white' }}>
      <div className="loader" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #8b5cf6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
      <h2>Grouping...</h2>
      <p>Assigning you to a balanced match ground.</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

// 步骤 2：显示报名成功，等待管理员分组
  if (step === 2) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#064e3b', borderRadius: '20px', border: '2px solid #10b981' }}>
        <h2 style={{ color: '#6ee7b7' }}>🎉 Registration Complete!</h2>
        
        <div style={{ margin: '30px 0' }}>
          {/* ✅ 重点：这里直接写文字，不要写 {ground} 变量 */}
          <div style={{ fontSize: '3em', color: 'white', fontWeight: '900', textTransform: 'uppercase' }}>
            Waiting for Grouping
          </div>
       </div>
          <button 
          onClick={onFinish} 
          style={{ 
            ...loginBtnStyle, 
            backgroundColor: '#10b981', 
            padding: '15px 40px', 
            fontSize: '1.1em', 
            cursor: 'pointer',
            border: 'none',
            borderRadius: '8px',
            color: 'white'
          }}
        >
          Confirm & Return to Dashboard
        </button>


        <p style={{ color: '#a7f3d0', marginTop: '20px', fontSize: '0.85em', opacity: 0.8 }}>
          You can link your OGS account in the "YOU" tab later.
        </p>

      </div>
    );
   }

  // ✅ 如果上面的 if 都不满足，最后才执行这个保底返回
  return null;
}

const getEventStatus = (deadline) => {
  if (!deadline) return { isExpired: false, timeLeft: null };
  const diff = new Date(deadline) - new Date();
  const isExpired = diff <= 0;
  if (isExpired) return { isExpired: true, timeLeft: "Registration Closed" };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  let timeLeft = "";
  if (days > 0) timeLeft = `${days}d ${hours}h left`;
  else if (hours > 0) timeLeft = `${hours}h ${minutes}m left`;
  else timeLeft = `${minutes}m left`;

  return { isExpired: false, timeLeft };
};

// --- 3. 主 App 组件 ---
export default function App() {
  // 1. 状态定义区 (确保顺序正确，先定义再使用)
  const [activeTab, setActiveTab] = useState('events');
  const [isVerified, setIsVerified] = useState(false);
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  
  // ✨ 插入点 1：注册相关的状态
  const [isRegistering, setIsRegistering] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isRegistrationOpen = (deadline) => {
    if (!deadline) return true; // 没设截止日期则默认开放
    return new Date() < new Date(deadline);
  };

useEffect(() => {
  // 1. 同步状态：如果路径回到了首页/赛事页，强制把 activeTab 改回 'events'
  // 这样才能解决点击 Back 后其他标签页点不动的问题
  if (location.pathname === '/events' || location.pathname === '/') {
    setActiveTab('events');
  }
  
  // 如果发现是从报名页传回来的 state 里要求打开弹窗
  if (location.state?.openModal) {
    setIsRegistering(true); // 👈 这一行会自动弹出那个 Confirm 框

    // 【可选但重要】清理 state，防止用户刷新页面时又自动弹出
    window.history.replaceState({}, document.title);
  }
}, [location, setActiveTab]); // 加上依赖项

  const [selectedEventId, setSelectedEventId] = useState(null);

  // 留言状态：包含默认欢迎词和输入框文字
  const [inputText, setInputText] = useState(""); 
  const [messages, setMessages] = useState([
    { id: 1, user_name: "Ronnie (Admin)", content: "Welcome to the new Jiayi Go message board!", created_at: new Date().toISOString() },
    { id: 2, user_name: "Guest Player", content: "Anyone up for a game later tonight?", created_at: new Date().toISOString() }
  ]);

  const handleEventClick = (eventId) => {
    const targetEvent = events.find(e => e.id === eventId);
   if (targetEvent && !isRegistrationOpen(targetEvent.registration_deadline)) 
    {
    return alert(`Sorry, the registration for "${targetEvent.name}" has already closed.`);
    } 
    
    setSelectedEventId(eventId);
    setIsRegistering(true);
  };

  // 2. 统一数据获取函数 (抓取玩家、活动、留言)
  const fetchData = async () => {
    try {
      // 同时获取三项数据
      const { data: p } = await supabase.from('players').select('id, name, rank, rating').order('rating', { ascending: false });
      const { data: e } = await supabase.from('events').select('*');
      const { data: m, error: mError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (mError) throw mError;

      if (p) setPlayers(p);
      if (e) setEvents(e);
      // 如果数据库有留言，则覆盖默认显示的留言
      if (m && m.length > 0) setMessages(m); 

    } catch (error) {
      console.error("❌ 数据获取失败:", error.message);
    }
  };

 // ✨ 新增：管理员更新赛事截止日期的函数
const updateEventDeadline = async (eventId, newDeadline) => {
   
  try {
    // 强制转换为数字，确保匹配数据库的 int8 类型
    const numericId = Number(eventId);
    const deadlineToStore = newDeadline ? new Date(newDeadline).toISOString() : null;

    const { data, error } = await supabase
      .from('events')
      .update({ registration_deadline: deadlineToStore })
      .eq('id', numericId)
      .select();

    if (error) throw error;
    
    if (data && data.length === 0) {
      alert("⚠️ Warning: No rows matched. Check if Event ID 1 exists.");
    } else {
      alert("✅ Deadline updated successfully!");
      alert(deadlineToStore ? "✅ Deadline updated!" : "🗑️ Deadline cleared!");
      await fetchData(); // 立即刷新页面数据
    } 
  } catch (err) {
    console.error("Update failed:", err.message);
    alert("❌ Error: " + err.message);
  }
}; 

  // 3. 登录/登出逻辑
  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("登录出错:", error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsVerified(false);
  };

  // 4. 发送留言逻辑 (存入数据库 + 自动刷新网页)
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            content: inputText,
            user_name: user.email,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      console.log("✅ 发送成功！");
      setInputText(""); // 清空输入框
      await fetchData(); // ✨ 刷新列表
    } catch (error) {
      console.error("❌ 发送失败:", error.message);
      alert("发送失败: " + error.message);
    }
  };

  const handleExportEventRegistrations = async (eventId, eventTitle) => {
  try {
    const { data: regData, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw error;
    if (!regData || regData.length === 0) {
      alert("该赛事暂时无人报名。");
      return;
    }

    const exportData = regData.map(reg => ({
      'Player Name': reg.user_name,
      'Registration Time': new Date(reg.created_at).toLocaleString(),
      'Event ID': reg.event_id
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    const fileName = `Registrations_${eventTitle || 'Event'}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (err) {
    console.error("Export Error:", err.message);
  }
};

  // 5. OGS 验证逻辑
  const handleOgsVerify = () => {
    const username = window.prompt("Enter your OGS Username:");
    const password = window.prompt("Enter your OGS Password:");

    if (username && password) {
      alert("OGS Verification Successful!");
      setIsVerified(true);
      setActiveTab('yourMatches'); 
    }
  };

  // 6. 生命周期监听 (初始化)
  useEffect(() => {
    if (supabase && supabase.auth) {
      // 检查当前登录状态
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });

      // 监听状态变化
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      fetchData();

      return () => {
        if (subscription) subscription.unsubscribe();
      };
    }
  }, []);

  // --- 后面接你的 return (JSX) 即可 ---

return (
    <div style={containerStyle}>
      {/* --- 1. 新增：注入旋转背景的 CSS --- */}
      <style>
        {`
          .bg-rotator {
            content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200vmax; /* 设大一点，确保 360 度覆盖 */
          height: 200vmax;
          background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/background.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: -1;
          transform: translate(-50%, -50%) rotate(90deg); /* 先居中再旋转 */
          }
        `}
      </style>

      {/* --- 2. 新增：专用的背景节点 --- */}
      <div className="bg-rotator"></div>

      {/* --- 3. 以下是你原本的结构，保持不变 --- */}
      <nav style={{ 
        ...navStyle, 
        position: 'relative',         
        zIndex: 10,  /* 确保在内容之上 */
        height: '80px',        /* 假设的导航栏高度，根据你实际情况定 */
        backgroundColor: 'rgba(0,0,0,0.2)', /* 略微加深背景增加对比度 */
        backdropFilter: 'blur(0px)',
        // ✨ 最关键的修复：允许 Logo 超出导航栏范围
        overflow: 'visible',
        // 保持 Navbar 内部的对齐
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px'
      }}>  

        <div 
          className={`nav-links ${isMenuOpen ? 'open' : ''}`} // 👈 这里使用了 isMenuOpen，消除警告
          style={{ 
            display: 'flex',         
            gap: '25px', 
            alignItems: 'center',          
            justifyContent: 'flex-end', 
            marginRight: '110px', 
          flex: 1 
          }}>
          {['events', 'players', 'you', 'admin', 'yourMatches']
            .filter(tab => {
              if (tab === 'you') return !!user;
              if (tab === 'admin') return user?.email === "bjmyschool@gmail.com";
              if (tab === 'yourMatches') return isVerified;
              return true;
            })
.map(t => (
              <span key={t} 
                style={{
                  ...(activeTab === t ? activeTabStyle : tabStyle),
                  cursor: 'pointer', /* ✨ 确保鼠标变小手 */
                  padding: '5px 10px'
                }}
                onClick={() => {
                  console.log("切换到:", t);
                  setActiveTab(t);
                  setIsMenuOpen(false); // 👈 切换标签时自动关闭手机菜单
                }}>
                {t === 'yourMatches' ? 'YOUR MATCHES' : t.toUpperCase()}
              </span>
            ))}
          <button
            style={{ ...loginBtnStyle, cursor: 'pointer' }}
            onClick={user ? handleLogout : handleLogin}
          >
            {user ? 'SIGN OUT' : 'SIGN IN'}
          </button>
        </div>
      </nav>
    

      <div style={contentStyle}>
        {activeTab === 'events' && <EventsPage events={events} onEventClick={handleEventClick} />}
       {/* ✨ 新增：报名流程页面渲染 */}
       {activeTab === 'registration_flow' && (
       <RegistrationFlow 
       user={user} 
       selectedEventId={selectedEventId} 
       events={events} 
        onFinish={() => setActiveTab('you')} 
        />
      )}
        {activeTab === 'players' && (
          <div style={listStyle}>
            <h1 style={headerStyle}>Rankings</h1>
            {players.map(p => (
              <div key={p.id} style={cardStyle}>
                <div style={infoStyle}>
                  <span style={idStyle}>#{p.id.toString().slice(0, 4)}</span>
                  <span style={nameStyle}>{p.name}</span>
                </div>
                <div style={infoStyle}>
                  <span style={rankStyle}>{p.rank}</span>
                  <span style={ratingStyle}>{p.rating} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}

{activeTab === 'admin' && (
  /* 1. 外层增加这个 div 并应用你定义的 adminContainerStyle */
  <div style={adminContainerStyle}>
    {user?.email === "bjmyschool@gmail.com" ? (
<>
        {/* --- ✨ 新增：管理后台顶部的 LOGO 或预览图 --- */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div>
          <p style={{ color: '#94a3b8', fontSize: '0.9em' }}>Admin Control Panel</p>
          </div>

        {/* 📥 这是你的新按钮！ */}
          <button 
            onClick={() => {
              // 这里直接调用导出逻辑
              const exportData = players.map(p => ({
                'Player ID': p.id,
                'Name': p.name,
                'Rank': p.rank,
                'Rating': p.rating
              }));
              const ws = XLSX.utils.json_to_sheet(exportData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Players");
              XLSX.writeFile(wb, `Jiayi_Go_Players_${new Date().toISOString().slice(0,10)}.xlsx`);
            }}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85em',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            📥 Export Excel
          </button>
        </div>      

      {/* --- 赛事报名导出区 --- */}
<div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
  <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1em' }}>Export Event Rosters</h3>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
    {events.map(event => (
      <button 
        key={event.id}
        onClick={() => handleExportEventRegistrations(event.id, event.title)}
        style={{
          backgroundColor: '#059669',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.8em',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        📥 {event.title || 'Unnamed Event'}
      </button>
    ))}
  </div>
</div>
 
<div style={{ 
  marginTop: '20px', 
  padding: '20px', 
  backgroundColor: 'rgba(30, 41, 59, 0.7)', // 深色半透明背景
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
}}>
  <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
    📅 Registration Deadlines
  </h3>
  
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {events.map(event => (
      <div key={event.id} style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '12px',
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <div style={{ color: 'white', fontWeight: '500' }}>
          {event.name ||event.title || 'Unnamed Event'}
        </div>

        {/* ✨ 重点：左侧显示当前的截止日期文字 */}
        <div style={{ fontSize: '0.85em', color: '#94a3b8' }}>
          <span style={{ color: '#8b5cf6', marginRight: '5px' }}>●</span>
          Current Deadline: 
          <strong style={{ color: '#f8fafc', marginLeft: '5px' }}>
            {event.registration_deadline 
              ? new Date(event.registration_deadline).toLocaleString('en-CA', { hour12: false }) 
              : "Not Set"}
          </strong>
        </div>


        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="datetime-local" 
            // 格式化时间以适配 input 展示：2026-04-27T09:00
            defaultValue={event.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : ""}
            id={`deadline-${event.id}`}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #475569',
              backgroundColor: '#0f172a',
              color: 'white',
              fontSize: '0.85em'
            }}
          />
          <button 
            onClick={() => {
              const val = document.getElementById(`deadline-${event.id}`).value;
              updateEventDeadline(event.id, val);
            }}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '6px 15px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85em',
              transition: 'all 0.2s'
            }}
          >
            Update
          </button>
          
          {/* ✨ 新增：Clear 按钮 */}
  
  <button 
    onClick={() => {
      if (window.confirm("Are you sure you want to clear the deadline?")) {
        // 传入空字符串，触发函数中的 null 逻辑
        updateEventDeadline(event.id, ""); 
        // 将输入框内容也清空
        document.getElementById(`deadline-${event.id}`).value = "";
      }
    }}
    style={{
      backgroundColor: 'transparent',
      color: '#ef4444',
      border: '1px solid #ef4444',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.85em'
    }}
  >
    Clear
  </button>


        </div>
      </div>
    ))}
  </div>
</div>

      <AdminPlayersPage players={players} fetchPlayers={fetchData} setActiveTab={setActiveTab} />
      
      </> // 👈 就是这里！刚才漏掉了这个闭合标签
    ) : (
      <div style={{ padding: '50px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', color: '#1e293b' }}>
        <h2 style={{ color: '#e61d2b' }}>🔒 Access Denied</h2>
        <p>仅限管理员 <b>bjmyschool@gmail.com</b> 访问。</p>
        <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#64748b', borderTop: '1px dotted #ccc', paddingTop: '20px' }}>
          {user ? (
            <p>当前登录账号: {user.email} <br /> (请使用管理员账号重新登录)</p>
          ) : (
            <p>您当前未登录，请先点击右上角 <b>SIGN IN</b></p>
          )}
        </div>

       {/* 增加一个返回按钮，防止普通用户卡死在这里 */}
        <button 
          onClick={() => setActiveTab('events')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#1e293b',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Return to Events
        </button> 
      </div>
    )}
  </div>
)}

        {activeTab === 'you' && (
          <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '16px', color: '#1e293b' }}>
            <h2 style={{ ...headerStyle, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      💬 Communication
    </h2>
            
{/* --- 1. 留言显示区 --- */}
<div style={{ 
  height: '300px', 
  overflowY: 'auto', 
  marginBottom: '20px', 
  padding: '20px', 
  backgroundColor: '#f1f5f9', 
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
}}>
  {/* ✨ 这一步最关键：让 React 根据 messages 数组的内容自动画出留言条 */}
  {messages.map((msg) => (
    <div key={msg.id} style={messageContainerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{msg.user_name || msg.user}</span>
        <span style={{ fontSize: '0.8em', color: '#94a3b8' }}>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : msg.time}</span>
      </div>
      <p style={{ margin: 0, color: '#475569', fontSize: '0.95em', lineHeight: '1.5' }}>
        {msg.content || msg.text}
      </p>
    </div>
  ))}
</div>

   {/* --- 2. 留言输入区 --- */}
<div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
  <input 
    type="text" 
    value={inputText} 
    onChange={(e) => setInputText(e.target.value)} 

onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSendMessage();
      }
    }}

    placeholder="Type your message..." 
    style={{ 
      flex: 1, 
      padding: '12px 16px', 
      borderRadius: '10px', 
      border: '2px solid #e2e8f0',
      outline: 'none',
      fontSize: '0.95em'
    }}
  />

  {/* ✨ 唯一的按钮：既有黑底白字的样式，又执行 handleSendMessage 函数 */}
  <button 
    onClick={handleSendMessage} 
    style={{ 
      backgroundColor: '#1e293b', 
      color: 'white', 
      padding: '0 25px', 
      borderRadius: '10px', 
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background 0.2s'
    }}
  >
    Send
  </button>
</div>

    {/* --- 3. 底部 OGS 登录入口 (变轻量了) --- */}
    <div style={{ 
      paddingTop: '20px', 
      borderTop: '2px dashed #f1f5f9', 
      textAlign: 'center' 
    }}>
      <p style={{ color: '#94a3b8', fontSize: '0.85em', marginBottom: '12px' }}>
        Looking for your tournament records?
      </p>
      <button 
        onClick={handleOgsVerify} 
        style={{
          backgroundColor: 'transparent',
          color: '#64748b',
          padding: '8px 20px',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          cursor: 'pointer',
          fontSize: '0.85em',
          fontWeight: '600'
        }}
      >
        🏆 Link OGS Account
      </button>
            </div>
          </div> /* ✅ 闭合 Dashboard 的内层 div */
        )} {/* ✅ 闭合 activeTab === 'you' 的逻辑 */}

        {/* --- YOUR MATCHES 页面内容 --- */}
        {activeTab === 'yourMatches' && (
          <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '16px', color: '#1e293b' }}>
            <h1 style={headerStyle}>🏆 Your Matches</h1>

            <h3 style={sectionTitleStyle}>NEXT MATCH</h3>
            <div style={nextMatchCardStyle}>
              <div style={roundBadgeStyle}>Round 2</div>
              
              <div style={matchInfoStyle}>
                <div style={blackStoneIcon} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={playerNameStyle}>张三 <span style={rankPillStyle}>17k</span></div>
            
    {/* 2. 🚀 新增：对手邮箱 (紧贴在名字下面) */}
    <div style={{ 
      fontSize: '0.85em', 
      color: '#64748b', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '4px' 
    }}>
      📧 <a 
        href="mailto:opponent@example.com" 
        style={{ color: '#3b82f6', textDecoration: 'none' }}
      >
        opponent@example.com
      </a>
    </div>
  </div>
</div>

              <div style={matchTimeStyle}>
                <div style={{ fontWeight: 'bold' }}>Apr 16 9:00 pm</div>
                
                <a 
    href="https://online-go.com/play" 
    target="_blank" 
    rel="noreferrer" 
    style={{
      ...playBtnStyle, 
      textDecoration: 'none', 
      display: 'inline-flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginTop: '8px'
    }}
  >
    ✅ Let's Play!
  </a>
              
              </div>
            </div>

            <h3 style={sectionTitleStyle}>HISTORY</h3>
            <div style={historyCardStyle}>
              <div style={smallRoundBadgeStyle}>Round 1</div>
              <div style={whiteStoneIcon} />
              <div style={{ flex: 1, marginLeft: '15px', color: '#333' }}>
                <strong>Greg</strong> <span style={noResultBadgeStyle}>No Result</span>
              </div>
              <div style={historyTimeStyle}>Apr 9</div>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button 
                onClick={() => { setIsVerified(false); setActiveTab('you'); }} 
                style={{ color: '#e61d2b', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9em' }}
              >
                ← Logout from OGS
              </button>
            </div>
          </div>
        )}
      </div> {/* ✅ 闭合 contentStyle 的 div */}

{/* --- ✨ 就在这里插入：注册确认弹窗 (Modal) --- */}
      {isRegistering && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999, // 确保在最前面
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid #8b5cf6',
            textAlign: 'center',
            maxWidth: '400px',
            color: 'white'
          }}>
            <h2 style={{ marginBottom: '10px' }}>Confirm Registration</h2>
            
            {/* 🟢 第一步：在这里开始逻辑计算 */}
            {(() => {
               const currentEvent = events.find(e => e.id === selectedEventId);
               const isOpen = isRegistrationOpen(currentEvent?.registration_deadline);

             // 🟢 第二步：根据计算结果返回 UI 
             return (
              <>            
                {isOpen ? (
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
                   Would you like to register for this event?
              </p>
            ) : (
              <p style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '30px' }}>
                ⚠️ Registration has ended for this event.
              </p>
            )}
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setIsRegistering(false)} 
                style={{ ...deleteBtnStyle, flex: 1, padding: '12px', height: 'auto' }}
              >
                Cancel
              </button>

              <button 
                onClick={() => {
                if (!isOpen) {
                    alert("Sorry, the deadline has passed!");
                    setIsRegistering(false);
                    return;
                  }
                  setIsRegistering(false); 
                  setActiveTab('registration_flow'); 
                }}
                style={{ 
                  ...addBtnStyle, 
                  flex: 1, 
                  padding: '12px', 
                  height: 'auto',
                  backgroundColor: isOpen ? '#8b5cf6' : '#475569', 
                  cursor: isOpen ? 'pointer' : 'not-allowed'
                }}
              >
                Confirm
              </button>
            </div>
            </>
            );
          })()}
          </div>
        </div>
      )}

    </div> /* ✅ 闭合 containerStyle 的主体 div */
  );
}



