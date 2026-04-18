import { createClient } from '@supabase/supabase-js'

// 替换成你在后台看到的真实数据
const supabaseUrl = 'https://wupuhfafbidjstpystyj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cHVoZmFmYmlkanN0cHlzdHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMjM4NDMsImV4cCI6MjA5MTU5OTg0M30.o7oLcLbJmYg0uuUssF-qIIYw2qMzwWaGONyNmp2EFgM'

// 创建并导出客户端实例
export const supabase = createClient(supabaseUrl, supabaseKey)