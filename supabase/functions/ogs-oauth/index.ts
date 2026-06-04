import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apiKey, content-type',
}

serve(async (req) => {
  // 1. 响应前端的 OPTIONS 预检请求 (CORS 跨域必备)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, redirect_uri } = await req.json()

    // 🔒 2. 去 OGS 官方服务器换取 Access Token
    const tokenUrl = "https://online-go.com/oauth2/token/"
    
    const params = new URLSearchParams()
    // 💡 记得把下面这两个换成你在 OGS 开发者后台申请到的真实凭据
    params.append('client_id', 'dRyqsrNvJWbyOiSdTkFW1gRPgDNZGTB43AYLbtvd')
    params.append('client_secret', 'wTFsUc5C2JnnySahYeFLEpCpx2vm3vM9lT9LNDREIBpY8iqCBTQqBJPVs7OU5BNbLJARjpMh9x8p7Rqco1qO27SOEtv1o8QLHviBcJiRhmTAfSSB3eLwDUW0cfQFe2Xs')
    params.append('grant_type', 'authorization_code')
    params.append('code', code)
    params.append('redirect_uri', redirect_uri)

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    })

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text()
      throw new Error(`OGS Token 换取失败: ${errBody}`)
    }

    const tokenData = await tokenResponse.json()

    // 👤 3. 用刚拿到的 Token 捞一下该选手的 OGS 个人信息（比如用户名）
    const meResponse = await fetch("https://online-go.com/api/v1/me", {
      headers: { "Authorization": `Bearer ${tokenData.access_token}` }
    })
    const meData = await meResponse.json()

    // 💾 4. 连接你的 Supabase 数据库，把数据砸进 profiles 表
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 安全获取当前登录的平台用户 uid
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("未授权的平台用户")

    // 更新该用户的 OGS 绑定状态
    const { error: dbError } = await supabaseClient
      .from('profiles')
      .update({
        ogs_username: meData.username,
        ogs_access_token: tokenData.access_token,
        ogs_refresh_token: tokenData.refresh_token,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ success: true, ogs_username: meData.username }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})