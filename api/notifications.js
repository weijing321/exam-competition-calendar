/**
 * Notifications API - Vercel Serverless Function
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { user_id, days = 7 } = req.query;
      const now = new Date().toISOString();
      const future = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString();

      const competitionsQuery = supabaseAdmin
        .from('competitions')
        .select('*')
        .gte('registration_deadline', now)
        .lte('registration_deadline', future)
        .order('registration_deadline', { ascending: true });

      const examsQuery = supabaseAdmin
        .from('exams')
        .select('*')
        .gte('registration_start', now)
        .lte('registration_start', future)
        .order('registration_start', { ascending: true });

      const [compResult, examResult] = await Promise.all([competitionsQuery, examsQuery]);

      if (compResult.error) throw compResult.error;
      if (examResult.error) throw examResult.error;

      const notifications = [
        ...(compResult.data || []).map(c => ({
          id: `comp-${c.id}`,
          type: 'competition',
          title: c.name,
          message: `报名截止: ${c.registration_deadline}`,
          date: c.registration_deadline,
          read: false,
        })),
        ...(examResult.data || []).map(e => ({
          id: `exam-${e.id}`,
          type: 'exam',
          title: e.name,
          message: `报名开始: ${e.registration_start}`,
          date: e.registration_start,
          read: false,
        })),
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return res.status(200).json(notifications);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Notifications API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
