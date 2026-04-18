import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// --- 1. 样式定义 (包含 YOU 页面所需的所有样式) ---
const containerStyle = { width: '100%',
  minHeight: '100vh',
  backgroundImage: "linear-gradient(rgba(5, 55, 20, 0), rgba(255, 255, 255, 0.1)), url('/background.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
  color: 'white'};
const navStyle = { display: 'flex', justifyContent: 'space-between', padding: '20px 60px', borderBottom: '1px solid #1e293b', alignItems: 'center' };
const contentStyle = { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' };
const headerStyle = { fontSize: '2.2em', fontWeight: 'bold', color: '#1a1a1a', textShadow: '0px 0px 5px rgba(255, 255, 255, 0.8)', marginBottom: '24px' };
const tabStyle = { color: '#000000', cursor: 'pointer', transition: '0.3s', padding: '5px 10px' };
const activeTabStyle = { color: '#000000', cursor: 'pointer', borderBottom: '2px solid #e61d2b', paddingBottom: '8px', fontWeight: 'bold' };

const listStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const cardStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '16px 24px', borderRadius: '12px', border: '1px solid #334155' };
const infoStyle = { display: 'flex', gap: '24px', alignItems: 'center' };
const idStyle = { color: '#475569', fontSize: '0.9em' };
const nameStyle = { fontSize: '1.1em', fontWeight: '600' };
const rankStyle = { backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '4px 10px', borderRadius: '6px' };
const ratingStyle = { color: '#94a3b8' };
const loginBtnStyle = { backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

// ADMIN & YOU 页面专属样式
const adminFormStyle = { display: 'flex', gap: '10px', marginBottom: '30px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #8b5cf6' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', flex: 1 };
const addBtnStyle = { backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const deleteBtnStyle = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8em' };

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
    // 1. 核心：从之前的 rgba(30, 39, 56) 调亮到 (50, 60, 80)
    // 这样它比背景亮，但又不是白色
    backgroundColor: '#323c50', 
    
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '25px',
    display: 'flex',
    flexDirection: 'column',
    
    // 2. 增加一个淡紫色的边框，呼应你的 Logo 颜色，增加呼吸感
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
            
            {/* 1. 给图片加上 alt 属性，解决 Line 92 的警告 */}
            <div style={{ height: '180px', overflow: 'hidden' }}>
              <img 
                src="/background1.jpg" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                alt={ev.name || "Event thumbnail"} 
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
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);

  const fetchData = async () => {
    const { data: p } = await supabase.from('players').select('id, name, rank, rating').order('rating', { ascending: false });
    const { data: e } = await supabase.from('events').select('*');
    
    if (p) setPlayers(p);
    if (e) setEvents(e);
  };

  // --- 把这段代码复制进去 ---
  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // 这行代码确保 Google 登录后会精准跳回你的 localhost:3000
          redirectTo: 'http://localhost:3000',
          queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("登录出错:", error.message);
    }
  };

const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
      <nav style={navStyle}>
        <div style={{ fontWeight: 'bold', color: '#e61d2b', fontSize: '1.4em' }}>JIAYI GO</div>
        <div style={{ display: 'flex', gap: '25px' }}>
          {['events', 'players', 'you', 'admin']
          .filter(tab => {
    if (tab === 'you') return !!user; 
    if (tab === 'admin') return user?.email === "bjmyschool@gmail.com";
    return true;
  })
      .map(t => (
            <span key={t} style={activeTab === t ? activeTabStyle : tabStyle} onClick={() => setActiveTab(t)}>{t.toUpperCase()}</span>
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
  user?.email === "bjmyschool@gmail.com" ? (
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
  )
)}

        {activeTab === 'you' && (
          <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '16px', color: '#1e293b' }}>
            <h2>User Dashboard</h2>
            
            <h3 style={sectionTitleStyle}>NEXT MATCH</h3>
            <div style={nextMatchCardStyle}>
              <div style={roundBadgeStyle}>Round 1</div>
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
               style={{...playBtnStyle, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}
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
                <strong>Greg HENDRICKS</strong> <span style={noResultBadgeStyle}>No Result</span>
              </div>
              <div style={historyTimeStyle}>Mar 30</div>
            </div>

{/* --- 这里是新加入的管理员入口 --- */}
    {user?.email === "bjmyschool@gmail.com" && (
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        borderTop: '2px dashed #e2e8f0', 
        textAlign: 'center' 
      }}>
        <p style={{ color: '#64748b', fontSize: '0.9em', marginBottom: '15px' }}>Administrator Access</p>
        <button 
          onClick={() => setActiveTab('admin')}
          style={{
            backgroundColor: '#1e293b',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          ⚙️ Manage JIAYI Players
        </button>
      </div>
    )}
    {/* --- 入口结束 --- */}

          </div>
        )}

      </div>
    </div>
  );
}