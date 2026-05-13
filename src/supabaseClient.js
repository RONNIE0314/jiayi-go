import { createClient } from '@supabase/supabase-js'

// 替换成你在后台看到的真实数据
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
// 创建并导出客户端实例
export const supabase = createClient(supabaseUrl, supabaseKey)