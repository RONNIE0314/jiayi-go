import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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

const imgStyle = {
  width: '100%',
  height: '100%',
  // 关键：cover 会自动裁剪多余部分，保证铺满且不留白
  objectFit: 'cover', 
  display: 'block',
  // 暂时移除 rotate，让它按原图方向显示
  transform: 'none' 
};

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

// --- 2. 页面子组件 ---

// 活动页
function EventsPage({ events }) {

const eventCardStyle = {
    backgroundColor: '#323c50', 
    borderRadius: '16px',
    overflow: 'hidden', // 👈 必须：剪掉旋转后多出来的图片
    marginBottom: '25px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(157, 125, 250, 0.3)', 
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
    width: '100%',
    maxWidth: '400px',
    transition: 'transform 0.2s'
  };

  // 文字颜色建议
  const titleStyle = {
    margin: '0 0 10px 0', 
    color: '#ffffff', // 标题依然用纯白，最清晰
    fontSize: '1.4rem', 
    fontWeight: 'bold'
  };

  const textStyle = {
    color: '#d1d1d1', // 正文用浅灰色，看起来不累眼
    fontSize: '0.95rem', 
    marginBottom: '5px'
  };

  const infoBoxStyle = {
    padding: '20px',
    textAlign: 'left'
  };

  return (
    <div style={listStyle}>
      <h1 style={headerStyle}>Upcoming Events</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', justifyContent: 'flex-start' }}>
        {events.map((ev) => (
          <div key={ev.id} style={eventCardStyle}>
            
{/* EventsPage 里的图片部分 */}
<div style={{ 
  width: '100%',
  // 关键：给一个固定高度，或者使用 aspect-ratio: '16/9'
  height: '200px', 
  overflow: 'hidden',
  borderRadius: '12px 12px 0 0', // 只给上方圆角
  backgroundColor: '#1e293b' // 失败时的底色
}}>
  <img 
    src="/background1.jpg" 
    alt={ev.name} 
    style={imgStyle} 
  />
</div>

            {/* 2. ✅ 使用 infoBoxStyle 包装文字，解决 Line 80 的警告 */}
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
function AdminPlayersPage({ players, fetchPlayers }) {
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
    <div>
      <h1 style={headerStyle}>Admin: Players Management</h1>
      <div style={adminFormStyle}>
        <input style={inputStyle} placeholder="Name" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} />
        <input style={inputStyle} placeholder="Rank (e.g. 1d)" value={newPlayer.rank} onChange={e => setNewPlayer({...newPlayer, rank: e.target.value})} />
        <input style={inputStyle} type="number" placeholder="Rating" value={newPlayer.rating} onChange={e => setNewPlayer({...newPlayer, rating: e.target.value})} />
        <button style={addBtnStyle} onClick={handleAdd}>ADD</button>
      </div>
      <div style={listStyle}>
        {players.map(p => (
          <div key={p.id} style={cardStyle}>
            <div style={infoStyle}><span style={nameStyle}>{p.name}</span><span style={rankStyle}>{p.rank}</span></div>
            <button style={deleteBtnStyle} onClick={() => handleDelete(p.id)}>DELETE</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 3. 主 App 组件 ---
export default function App() {
  const [activeTab, setActiveTab] = useState('events');
  const [isVerified, setIsVerified] = useState(false);
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);

  // 1. 用来存储所有的留言列表
const [messages, setMessages] = useState([
  { id: 1, user: "Ronnie (Admin)", text: "Welcome to the new Jiayi Go message board!", time: "19:00" },
  { id: 2, user: "Guest Player", text: "Anyone up for a game later tonight?", time: "19:05" }
]);

// 2. 用来记录当前输入框里的文字
const [inputText, setInputText] = useState("");

  const fetchData = async () => {
    const { data: p } = await supabase.from('players').select('id, name, rank, rating').order('rating', { ascending: false });
    const { data: e } = await supabase.from('events').select('*');
    
    if (p) setPlayers(p);
    if (e) setEvents(e);
  };

const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // 自动获取域名，适配 localhost 或线上环境
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }, // 👈 这一行后面是逗号，闭合的是 options
      }); // 👈 这一行是圆括号 + 分号，闭合的是整个 signInWithOAuth

      if (error) throw error;
    } catch (error) {
      console.error("登录出错:", error.message);
    }
  };

const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsVerified(false); // ✅ 退出登录时，同时也重置 OGS 验证状态
  };

  // --- 处理 OGS 验证 (非管理员点击按钮触发) ---
  const handleOgsVerify = () => {
    const username = window.prompt("Enter your OGS Username:");
    const password = window.prompt("Enter your OGS Password:");

    if (username && password) {
      // 这里可以替换为真实的验证逻辑
      alert("OGS Verification Successful!");
      setIsVerified(true);   // ✅ 解锁 YOU MATCHES 标签
      setActiveTab('yourMatches'); // ✅ 自动跳转到新标签
    }
  };

useEffect(() => {
    if (supabase && supabase.auth) {
      // 1. 页面刚刷新时：立刻检查一次缓存里有没有用户信息
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log("Initial Session:", session?.user?.email || "No user");
        setUser(session?.user ?? null);
      });

      // 2. 状态监听：当从 Google 登录成功跳转回来时，这部分代码会自动触发
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("Auth Event:", _event, session?.user?.email);
        setUser(session?.user ?? null);
      });

      fetchData();
      return () => {
        if (subscription) subscription.unsubscribe();
      };
    }
  }, []);

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
      <nav style={navStyle}>
        <div style={{ fontWeight: 'bold', color: '#e61d2b', fontSize: '1.4em' }}>JIAYI GO</div>
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          {['events', 'players', 'you', 'admin', 'yourMatches']
            .filter(tab => {
              if (tab === 'you') return !!user;
              if (tab === 'admin') return user?.email === "bjmyschool@gmail.com";
              if (tab === 'yourMatches') return isVerified;
              return true;
            })
            .map(t => (
              <span key={t} style={activeTab === t ? activeTabStyle : tabStyle}
                onClick={() => setActiveTab(t)}>
                {t === 'yourMatches' ? 'YOUR MATCHES' : t.toUpperCase()}
              </span>
            ))}
          <button
            style={loginBtnStyle}
            onClick={user ? handleLogout : handleLogin}
          >
            {user ? 'SIGN OUT' : 'SIGN IN'}
          </button>
        </div>
      </nav>
    

      <div style={contentStyle}>
        {activeTab === 'events' && <EventsPage events={events} />}

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
      <AdminPlayersPage players={players} fetchPlayers={fetchData} />
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
      </div>
    )}
  </div>
)}

        {activeTab === 'you' && (
          <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '16px', color: '#1e293b' }}>
            <h2 style={{ ...headerStyle, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      💬 Community Message Board
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
        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{msg.user}</span>
        <span style={{ fontSize: '0.8em', color: '#94a3b8' }}>{msg.time}</span>
      </div>
      <p style={{ margin: 0, color: '#475569', fontSize: '0.95em', lineHeight: '1.5' }}>
        {msg.text}
      </p>
    </div>
  ))}
</div>

    {/* --- 2. 留言输入区 --- */}
    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
      <input 
        type="text" 
value={inputText} // ✨ 绑定文字
    onChange={(e) => setInputText(e.target.value)} // ✨ 输入时更新状态
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
  <button 
    onClick={() => {
      if (inputText.trim() !== "") {
        // ✨ 点击时，把新留言加到列表顶部
        const newMessage = {
          id: Date.now(),
          user: "Me", 
          text: inputText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([newMessage, ...messages]); 
        setInputText(""); // ✨ 清空输入框
      }
    }}
      
      style={{ 
        backgroundColor: '#1e293b', 
        color: 'white', 
        padding: '0 25px', 
        borderRadius: '10px', 
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background 0.2s'
      }}>
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
                <div style={playerNameStyle}>张三 <span style={rankPillStyle}>17k</span></div>
              </div>
              <div style={matchTimeStyle}>
                <div style={{ fontWeight: 'bold' }}>Apr 16 9:00 pm</div>
                <a 
                  href="https://online-go.com/play" 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{...playBtnStyle, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px'}}
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
    </div> /* ✅ 闭合 containerStyle 的主体 div */
  );
}


