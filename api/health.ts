/**
 * /api/health 健康检查
 */

import { jsonResponse, handleOptions } from './_utils';

export default async function handler(req: any) {
  if (req.method === 'OPTIONS') return handleOptions();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('SUPABASE_ANON_KEY');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  return jsonResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: missing.length === 0 ? 'connected' : 'misconfigured',
    missing: missing.length > 0 ? missing : undefined,
  });
}
