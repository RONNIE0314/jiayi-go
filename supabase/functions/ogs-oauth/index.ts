import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apiKey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, redirect_uri } = await req.json()

    // 1. 去 OGS 官方服务器换取 Access Token
    const tokenUrl = "https://online-go.com/oauth2/token/"
    const params = new URLSearchParams()
    params.append('client_id', 'dRygshrNvJWbyOiSdTkWF1gRPgDNZGTB43AYLbtvd')
    params.append('client_secret', 'wTfUc5C2JnnySahYeFLEpCpx2vm3vM9lT9LNDREIBpY8iqCBTQqBJPVs7OU5BNbLJARjpMh9x8p7Rqco1qO27SOEtv1o8QLHviBcJiRhmTAfSSB3eLwDUW0cfQFe2Xs')
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

    // 2. 捞一下该选选手在 OGS 的个人信息
    const meResponse = await fetch("https://online-go.com/api/v1/me", {
      headers: { "Authorization": `Bearer ${tokenData.access_token}` }
    })
    
    // 💡 重点：先安全转化为 JSON 对象
    const meData = await meResponse.json()

    // 3. 连接 Supabase 数据库
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("未授权的平台用户")

    // 💡 4. 【高光时刻】三保险机制，绝对防止 NULL 的出现
    // 围棋平台有些返回 username，有些返回 name，如果都没有，直接用原本平台填写的 username 保底！
    const finalUsername = meData.username || meData.name || user.user_metadata?.username || 'OGS选手';

    const { error: dbError } = await supabaseClient
      .from('profiles')
      .update({
        ogs_username: finalUsername,
        ogs_access_token: tokenData.access_token,
        ogs_refresh_token: tokenData.refresh_token,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ success: true, ogs_username: finalUsername }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})