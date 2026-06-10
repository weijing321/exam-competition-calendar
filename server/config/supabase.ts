/**
 * Supabase 客户端配置
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 公开客户端（用于前端/普通API）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 服务角色客户端（用于需要绕过RLS的管理操作）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 检查配置是否完整
export function validateSupabaseConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('SUPABASE_ANON_KEY');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return { valid: missing.length === 0, missing };
}
