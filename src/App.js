import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import YourMatches from './YourMatches';
import { AdminMatchBinder } from './components/AdminMatchBinder';

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
const nameStyle = { 
  fontSize: '1.2em',
  fontWeight: '800',
  color: '#ffffff',
  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
};
const rankStyle = { 
  fontSize: '1.2em',
  fontWeight: '700',
  color: '#cbd5e1'
};
const ratingStyle = { 
  fontSize: '1.2em',
  fontWeight: '800',
  color: '#94a3b8' 
};
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
const deleteBtnStyle = { backgroundColor: '#7744ef', display: 'flex', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8em' };
const messageContainerStyle = {
  backgroundColor: 'white',
  padding: '12px 15px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
  borderLeft: '4px solid #1e293b', // 深色左边条增加质感
  textAlign: 'left' 
};

// --- 2. 页面子组件 ---
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
    <div style={listStyle}>
      
      {/* 🚀 1. 全局 LOGO：容器 */}
<div className="logo-wrapper">
  <img 
    src="/logo.jpg"
    alt="JIAYI GO BRAND" 
    className="main-logo"
    style={{ 
      height: '110px', 
      width: '110px',
      borderRadius: '50%',
      objectFit: 'cover',
      filter: 'drop-shadow(0 4px 6px rgba(9, 5, 65, 0.21))',
      boxShadow: '0 0 10px rgba(157, 125, 250, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.3)'
    }} 
    onError={(e) => { e.target.style.display = 'none'; }} 
  />
</div>

      {/* 2. 标题 */}
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
function AdminPlayersPage({ players, setPlayers, fetchPlayers, setActiveTab }) {
  const [newPlayer, setNewPlayer] = useState({ user_id: '', rank: '', rating: '' });
  const [profiles, setProfiles] = useState([]); // 这样定义 profiles
   
  useEffect(() => {
    const fetchCandidates = async () => {
      console.log("=== 正在拉取候选用户总表 ===");
      const { data } = await supabase.from('profiles').select('id, username');
      if (data) setProfiles(data);
    };
    fetchCandidates();
    fetchPlayers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const handleAdd = async (e) => {
    e.preventDefault();
    if (!newPlayer.user_id || !newPlayer.rank) return alert("Please select a User and Rank");
    
    // 🛠️ 修复 1：从 profiles 数组中，根据当前选中的 user_id 找出对应的用户名
    const selectedProfile = profiles.find(p => p.id === newPlayer.user_id);
    const chosenName = selectedProfile ? selectedProfile.username : "新选手";

    // 修改 2：插入字段改为 user_id
    const { error } = await supabase.from('players').insert([{ 
      user_id: newPlayer.user_id, // 关联外键
      player_name: chosenName, // ✨ 名字不再是空的
      rank: newPlayer.rank, 
      rating: parseInt(newPlayer.rating) || 0 
    }]);

    if (error) {
      console.error("数据库插入失败:", error);
      alert("Error: " + error.message);
    
    } else {
      setNewPlayer({ user_id: '', rank: '', rating: '' });
      
      // 🛠️ 3. 添加选手成功后，同样直接抓取并更新内部状态
      const { data } = await supabase.from('players').select('*');
      if (data) setPlayers(data);
    }
};

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm("Delete this player?")) {
      const { error } = await supabase.from('players').delete().eq('player_id', id);
      if (!error) {
    fetchPlayers();
    } else {
      console.error("删除失败:", error.message);
      alert("删除失败: " + error.message);
    }
    }
  };
  
  return (
    <div style={{ ...listStyle, position: 'relative', zIndex: 1 }}> {/* 👈 这里建议用 listStyle 包裹，确保边距统一 */}
      
      {/* ✨ 重点：在这里把 Logo 加上，不要删除首页的，而是这里也加一份 */}
      <div className="logo-wrapper" style={{ cursor: 'pointer', marginBottom: '20px' }}>
        <img 
          src="/logo.jpg" 
          alt="JIAYI GO BRAND" 
          className="main-logo"
          style={{ 
            height: '110px', width: '110px', borderRadius: '50%',
            objectFit: 'cover', cursor: 'pointer',
            filter: 'drop-shadow(0 4px 6px rgba(9, 5, 65, 0.21))',
            boxShadow: '0 0 10px rgba(157, 125, 250, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }} 
          onClick={() => setActiveTab('events')} 
        />
      </div>

      <h1 style={headerStyle}>Admin: Players Management</h1>
      
      <div style={{ ...adminFormStyle, position: 'relative', zIndex: 2 }}>
        <select 
          style={inputStyle} 
          value={newPlayer.user_id || ''} 
          onChange={(e) => setNewPlayer({...newPlayer, user_id: e.target.value})}
        >
          <option value="">请选择一名选手</option>
         {/* 🛠️ 核心修改 1：把外层选择框的 players.map 改回 profiles.map */}
{profiles && profiles.map(p => (
  <option key={p.id} value={p.id}>
    {p.username}
  </option>
))}
        </select>
        <input style={inputStyle} placeholder="Rank (e.g. 1d)" value={newPlayer.rank} onChange={e => setNewPlayer({...newPlayer, rank: e.target.value})} />
        <input style={inputStyle} type="number" placeholder="Rating" value={newPlayer.rating} onChange={e => setNewPlayer({...newPlayer, rating: e.target.value})} />
        <button style={{ ...addBtnStyle, pointerEvents: 'auto' }} onClick={handleAdd}>ADD</button>
      </div>
        
{players && players.map(p => {
  // 1. 安全降级取名逻辑：优先取 player_name，其次取 profiles 关联，最后用未知选手保底
  const displayName = p.player_name || p.profiles?.username || "未知选手";

  return (
    <div key={p.player_id || p.id} style={cardStyle}>
      <div style={infoStyle}>
        {/* 2. 修复：恢复正确的 style 变量引用 */}
        <span style={nameStyle}>{displayName}</span>
        <span style={rankStyle}>{p.rank || '无段位'}</span>
      </div>
      
      {/* 3. 修复：确保按钮正确闭合，并且逻辑通畅 */}
      <button
        style={{
          ...deleteBtnStyle,
          position: 'relative', 
          zIndex: 9999,
          display: 'block',     // 确保块级显示
          background: 'red'     // 强制显眼颜色，测试用
        }}
        onClick={(e) => {
          e.stopPropagation();  // 阻止父级容器拦截点击
          handleDelete(p.player_id); 
        }}
      >
        DELETE
      </button>
    </div>
  );
})}
    
    </div>
  );
}

// 赛事报名流程组件 (收集信息 + 分组动画 + 结果显示)
function RegistrationFlow({ user, selectedEventId, events, onFinish }) {
  const [step, setStep] = useState(0); // 0: Form, 1: Grouping, 2: Result
  const [ground, setGround] = useState(null);
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', rank: '', rating: '', password: ''
  });

const handleStartGrouping = async (e) => {
  e.preventDefault();
  try {
    // 1. 先查重 (静默进行)
    const { data: existingEntry, error: checkError } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', String(selectedEventId))
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingEntry) {
      alert("You have already registered for this event!");
      onFinish(); // 或者 setActiveTab('events')
      return; // 结束函数，不再执行后面的动画和插入
    }
  
  setStep(1); // 1. 进入转圈动画
  // ✨ 先生成一个随机数，这样我们既能存数据库，也能更新 UI 状态
  const assignedGround = Math.floor(Math.random() * 5) + 1;

     // 2. 将报名信息（含 Email）存入 Supabase
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
        ground: assignedGround // 使用刚才生成的数字
      }]);

    if (insertError) throw insertError;

    // ✅ 关键：调用 setGround。这会消除警告并让 step 2 显示正确的数字
    setGround(assignedGround);

    // 3. 模拟后台处理感，等 3 秒后再显示结果
    setTimeout(() => {
      setStep(2); 
    }, 3000);

  } catch (err) {
    console.error("Registration error:", err.message);
    alert("Registration failed: " + err.message);
    setStep(0);
  }
};

  if (step === 0) return (
    <div style={adminContainerStyle}>
{/* --- 新增：返回箭头按钮 --- */}
    <div 
      onClick={() => navigate('/events', { state: { openModal: true } })}
      style={{ 
        cursor: 'pointer', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '15px',
        width: 'fit-content', // 确保只有点击图标和文字区域才触发
        opacity: 0.8,
        transition: 'opacity 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
    >
      <span style={{ fontSize: '1.4em', marginRight: '8px', lineHeight: '1' }}>←</span>
      <span style={{ fontSize: '0.9em', fontWeight: '500' }}>Back</span>
    </div>
      <h2 style={{color:'white', marginBottom:'20px'}}>Tournament Entry: {selectedEvent?.name}</h2>
      <form onSubmit={handleStartGrouping} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input style={inputStyle} placeholder="Player Name" required onChange={e => setFormData({...formData, player_name: e.target.value})} />
        <input style={inputStyle} placeholder="Rank (e.g. 5k)" required onChange={e => setFormData({...formData, rank: e.target.value})} />
        <input style={inputStyle} placeholder="Current Rating" required onChange={e => setFormData({...formData, rating: e.target.value})} />
        <input style={inputStyle} type="text" placeholder="OGS Username" required onChange={e => setFormData({...formData, ogs_username: e.target.value})} />
        <input type="email" placeholder="Email Address" value={user?.email} readOnly style={{ ...inputStyle, opacity: 0.7 }} />
        <button type="submit" style={{...addBtnStyle, marginTop:'10px'}}>Join & Start Grouping</button>
      </form>
    </div>
  );

  if (step === 1) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'white' }}>
      <div className="loader" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #8b5cf6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
      <h2>Grouping...</h2>
      <p>Assigning you to a balanced match ground.</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

 return (
  <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#064e3b', borderRadius: '20px', border: '2px solid #10b981' }}>
    <h2 style={{ color: '#6ee7b7' }}>🎉 Grouping Complete!</h2>
    
    <div style={{ fontSize: '5em', color: 'white', fontWeight: '900', margin: '20px 0' }}>
      {ground} <span style={{fontSize:'0.3em'}}>GROUND</span>
    </div>
    
    {/* ✨ 我们把原来的 Link 按钮删掉，把 Return 按钮升级成大按钮 */}
    <button 
      onClick={onFinish} 
      style={{ 
        ...loginBtnStyle, 
        backgroundColor: '#10b981', 
        padding: '15px 40px',
        fontSize: '1.1em',
        cursor: 'pointer'
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

// 2. 统一数据获取函数 (抓取玩家、活动、留言)
  const fetchSupabaseData = async (setPlayers, setEvents, setMessages, setRegistrations) => {
    try {
      // 同时获取三项数据
      const {data: regData, error: regError} = await supabase
      .from('registrations')
      .select('*, profiles!inner(username)')
      .eq('profiles.is_deleted', false)
      
      if (regError) {
        console.error("API 请求依然报错:", regError);
      } else {
        setRegistrations(regData);
      }

      const { data: e } = await supabase.from('events').select('*');
      const { data: m, error: mError } = await supabase
        .from('messages')
        .select('id, content, created_at, player_id, profiles!inner(username)')
        .order('created_at', { ascending: false });

      if (mError) throw mError;

      if (regData) {
        setRegistrations(regData);
      }

      if (e) setEvents(e);
      // 如果数据库有留言，则覆盖默认显示的留言
      if (m && m.length > 0) setMessages(m); 

    } catch (error) {
      console.error("❌ 数据获取失败:", error.message);
    }
  };

// --- 3. 主 App 组件 ---
function App() {
  // 1. 状态定义区 (确保顺序正确，先定义再使用)
  const [activeTab, setActiveTab] = useState('events');
  const [isVerified, setIsVerified] = useState(false);
  const [players, setPlayers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);

  // ✨ 插入点 1：注册相关的状态
  const [isRegistering, setIsRegistering] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
    setSelectedEventId(eventId);
    setIsRegistering(true);
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
            player_id: user.id            
          }
        ]);

      if (error) throw error;

      setInputText(""); // 清空输入框
      await fetchSupabaseData(setPlayers, setEvents, setMessages, setRegistrations);
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
      'Player ID': reg.player_id,
      'Name': reg.player_name,
      'OGS Username': reg.ogs_username,
      'Rank': reg.rank,
      'Email': reg.user_email,
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

  // 🛠️ 使用 useCallback 锁死引用，防止它变成父组件渲染的传毒之源
  const handleAdminRefresh = useCallback(async () => {
    fetchSupabaseData(setPlayers, setEvents, setMessages, setRegistrations);
    const { data } = await supabase.from('players').select('*');
    if (data) {
      setPlayers(data); 
    }
  }, []); // 空依赖，一辈子引用不变

  // 6. 生命周期监听 (初始化)
  useEffect(() => {
    if (supabase && supabase.auth) {
      // 检查当前登录状态
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });

      // ✨ 调用外部定义的函数，传入 setters
      fetchSupabaseData(setPlayers, setEvents, setMessages, setRegistrations);

      // 监听状态变化
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

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
            
            {/* 表头（可选，增加专业感） */}
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', padding: '10px 20px', fontWeight: 'bold', color: '#fff' }}>
      <span>Name</span>
      <span>Rank</span>
      <span>Rating</span>
    </div>

{/* 🛠️ 终极修复：将数据源换成全局的 players 数组 */}
{/* 数据行 */}
{players && players
  .sort((a, b) => (parseInt(b.rating) || 0) - (parseInt(a.rating) || 0)) // 按照积分从高到低排序
  .map((player, index) => (
    <div key={player.player_id || player.id || index} style={{
      display: 'grid',
      gridTemplateColumns: '2fr 2fr 1fr',
      alignItems: 'center',
      padding: '12px 20px',
      borderBottom: '1px solid #334155',
      backgroundColor: index % 2 === 0 ? '#1e293b' : '#0f172a' // 保持完美的斑马线交替颜色
    }}>
      {/* 🛠️ 渲染完美的选手姓名 */}
      <span style={nameStyle}>{player.player_name || player.username || "未知选手"}</span>
      {/* 🛠️ 渲染选手段位 */}
      <span style={rankStyle}>{player.rank || "无"}</span>
      {/* 🛠️ 渲染选手积分 */}
      <span style={ratingStyle}>{player.rating || 0} pts</span>
    </div>
  ))
}
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
          <p style={{ color: '#94a3b8', marginTop: '10px', paddingBottom: '50px', fontSize: '0.9em' }}>Admin Control Panel</p>
          </div>
        <div style={{ padding: '20px' }}>
           {/* 🎯 把这台机器安放在这里，它就会自己开始工作！ */}
            <AdminMatchBinder />
        </div>
        {/* 📥 这是你的新按钮！ */}
          <button 
            onClick={() => {
              const exportData = registrations.map(reg => ({
               'Name': reg.player_name || "未知选手",
               'OGS Username': reg.ogs_username, // 这里就是你想要的字段
               'Rank': reg.rank,
               'Rating': reg.rating
              }));
              const ws = XLSX.utils.json_to_sheet(exportData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Registrations");
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
 
<AdminPlayersPage 
  players={players} 
  setPlayers={setPlayers}
  fetchPlayers={handleAdminRefresh} 
  setActiveTab={setActiveTab} 
/>
      
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
          
          <div style={{ marginTop: '40px', borderTop: '2px solid #e2e8f0' }}></div>

            <h2 style={{ ...headerStyle, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              💬 Communication
            </h2>

            {/* --- 1. 留言显示区 --- */}
            <div style={{ height: '300px', overflowY: 'auto', marginBottom: '20px', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={messageContainerStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{msg.profiles?.username || msg.user}</span>
                    <span style={{ fontSize: '0.8em', color: '#94a3b8' }}>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : msg.time}</span>
                  </div>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.95em', lineHeight: '1.5' }}>{msg.content || msg.text}</p>
                </div>
              ))}
            </div>

            {/* --- 2. 留言输入区 --- */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
              <input 
                type="text" 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Type your message..." 
                style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '0.95em' }}
              />
              <button onClick={handleSendMessage} style={{ backgroundColor: '#1e293b', color: 'white', padding: '0 25px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                Send
              </button>
            </div>

            {/* --- 3. 底部 OGS 登录入口 --- */}
            <div style={{ paddingTop: '20px', borderTop: '2px dashed #f1f5f9', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.85em', marginBottom: '12px' }}>Looking for your tournament records?</p>
              <button onClick={handleOgsVerify} style={{ backgroundColor: 'transparent', color: '#64748b', padding: '8px 20px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.85em', fontWeight: '600' }}>
                🏆 Link OGS Account
              </button>
            </div>
          </div>
        )}

        {/* --- 4. 注册确认弹窗 (与 'you' 块并列，都在 contentStyle 内) --- */}
        {isRegistering && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '20px', border: '1px solid #8b5cf6', textAlign: 'center', maxWidth: '400px', color: 'white' }}>
              <h2 style={{ marginBottom: '10px' }}>Confirm Registration</h2>
              <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Would you like to register for this event?</p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setIsRegistering(false)} style={{ ...deleteBtnStyle, flex: 1, padding: '12px' }}>Cancel</button>
                <button onClick={() => { setIsRegistering(false); setActiveTab('registration_flow'); }} style={{ ...addBtnStyle, flex: 1, padding: '12px' }}>Confirm</button>
              </div>
            </div>
          </div>
        )}

{/* 🎯 页面 2: 比赛记录 (全新全量数据版 Your Matches 页面) */}
{activeTab === 'yourMatches' && <YourMatches />}

      </div> {/* ✅ 闭合 contentStyle 的 div */}
    </div> /* ✅ 闭合 containerStyle 的 div */
  );
}

export default App;
