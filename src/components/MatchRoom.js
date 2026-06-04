import React from 'react';
import { supabase } from '../supabaseClient'; 

export function MatchRoom({ match, currentUserName }) {
  
  // 🛡️ 完美保留你原有的 Match 判空安全拦截
  if (!match) return null;

  // =========================================================================
  // ✨【安全修复版】带智能 OAuth2 绑定检测的进入/创建对局核心逻辑
  // =========================================================================
  const executeJump = async () => {
    try {
      // 🛡️ 安全防御：拦截检查 match.id 是否存在
      if (!match.id) {
        alert("❌ 错误: 前端组件中缺少比赛 ID (match.id)。");
        return;
      }

      console.log("🔍 正在为您检测最新的账号绑定状态，比赛 ID:", match.id);

      // 🔑 1.【安全修复】兼容新旧两版 Supabase 获取当前登录用户 UID 的方法
      let userId = null;
      try {
        // 先尝试新版 v2 异步写法
        const { data: authData } = await supabase.auth.getUser();
        userId = authData?.user?.id;
      } catch (e) {
        // 如果报错，自动降级切换到旧版 v1 同步写法
        userId = supabase.auth.user()?.id;
      }

      // 如果两种方法都没捞到，说明会话过期了
      if (!userId) {
        alert("❌ 登录会话已过期，请重新登录您的平台账号");
        return;
      }

      // 2. 📡 查询 profiles 表，看一眼该选手有没有关联 OGS 用户名
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('ogs_username')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("查询配置文件失败:", profileError);
      }

      // 3. 🛑 如果根本没绑定过，直接拦截，强行打发去 OGS 官方授权大门
      if (!profile || !profile.ogs_username) {
        console.log("👋 检测到未绑定 OGS 账号，开启 OAuth2 授权流...");
        const clientId = 'dRyqsrNvJWbyOiSdTkFW1gRPgDNZGTB43AYLbtvd';
        
        // 动态获取当前平台的域名 (本地就是 localhost:3000，线上就是 jiayi-go.vercel.app)
        const redirectUri = encodeURIComponent(window.location.origin); 
        
        // 拼接成完美的 OGS 官方授权大门链接
        const ogsAuthUrl = `https://online-go.com/oauth2/authorize/?client_id=${clientId}&response_type=code&scope=read+write&redirect_uri=${redirectUri}`;
        
        alert("📌 首次进入对局需要先绑定您的 OGS 官方账号，现在为您跳转授权...");
        window.location.href = ogsAuthUrl;
        return; // 👈 拦截成功，断流，不再往下走贴链接的逻辑
      }

      // 4. ✅ 如果已经绑定过了，才允许执行原有的“创建棋局、贴回链接”的常规比赛操作
      window.open("https://online-go.com/play", '_blank', 'noopener,noreferrer');

      const pastedUrl = window.prompt("请在此处粘贴您在 OGS 创建的对局链接 (例如: https://online-go.com/game/xxxxx)");

      if (!pastedUrl || !pastedUrl.trim() || !pastedUrl.includes("online-go.com")) {
        alert("❌ 操作已取消: 无效或空的 OGS 链接。");
        return;
      }

      const cleanUrl = pastedUrl.trim();

      // 5. 💾 将选手贴回的棋局网址更新写回数据库对局表
      const { error: updateError } = await supabase
        .from('user_matches')
        .update({ ogs_link: cleanUrl })
        .eq('id', String(match.id).trim());

      if (updateError) throw updateError;
      
      alert("🎉 棋局链接同步成功！");

    } catch (err) {
      console.error("❌ executeJump 内部发生致命异常:", err);
      alert(`错误: ${err.message}`);
    }
  };

  // =========================================================================
  // 🖨️ 视图渲染部分 (保持你原有的精美暗黑主题样式与布局)
  // =========================================================================
  const isPlayer = currentUserName === match.player_info?.name;
  const opponentName = isPlayer ? match.opponent_info?.name : match.player_info?.name;
  const opponentRank = isPlayer ? match.opponent_info?.rank : match.player_info?.rank;

  return (
    <div style={{
      background: '#1e1e1e',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      borderLeft: match.ogs_link ? '4px solid #4caf50' : '4px solid #ff9800'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', TreeItems: 'center' }}>
        <div>
          <span style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
            {match.round_name || '常规对局'}
          </span>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            ⚔️ vs <span style={{ color: '#fff' }}>{opponentName || '未知选手'}</span> 
            <span style={{ fontSize: '12px', color: '#aaa', marginLeft: '8px' }}>({opponentRank || '无段位'})</span>
          </div>
          
          {match.ogs_link && (
            <a 
              href={match.ogs_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#4caf50', fontSize: '13px', textDecoration: 'none', display: 'inline-block', marginTop: '8px' }}
            >
              🌐 点击直接观战/进入对局 ↗
            </a>
          )}
        </div>

        <div>
          <button 
            onClick={executeJump}
            style={{
              background: match.ogs_link ? '#333' : '#ff9800',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
          >
            {match.ogs_link ? '🔄 更新对局链接' : '👉 点击进入对局'}
          </button>
        </div>
      </div>
    </div>
  );
}