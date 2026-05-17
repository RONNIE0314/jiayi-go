import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 处理浏览器的跨域预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { code, client_id, client_secret, redirect_uri } = await req.json();

    // 拿着前端传来的 code，去 OGS 官方服务器换取真正的 Access Token
    const response = await fetch('https://online-go.com/oauth2/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id,
        client_secret,
        redirect_uri,
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      status: response.status,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})