/**
 * User API - Vercel Serverless Function
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { path } = req.query;

    // GET /api/user/favorites
    if (req.method === 'GET' && path === 'favorites') {
      const { user_id } = req.query;
      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }
      const { data, error } = await supabaseAdmin
        .from('favorites')
        .select('*')
        .eq('user_id', user_id);
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    // POST /api/user/favorites
    if (req.method === 'POST' && path === 'favorites') {
      const { user_id, item_id, item_type } = req.body;
      if (!user_id || !item_id || !item_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const { data, error } = await supabaseAdmin
        .from('favorites')
        .insert([{ user_id, item_id, item_type }])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    // DELETE /api/user/favorites
    if (req.method === 'DELETE' && path === 'favorites') {
      const { user_id, item_id } = req.query;
      if (!user_id || !item_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const { error } = await supabaseAdmin
        .from('favorites')
        .delete()
        .eq('user_id', user_id)
        .eq('item_id', item_id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // GET /api/user/settings
    if (req.method === 'GET' && path === 'settings') {
      const { user_id } = req.query;
      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }
      const { data, error } = await supabaseAdmin
        .from('user_settings')
        .select('*')
        .eq('user_id', user_id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return res.status(200).json(data || {
        user_id,
        notification_enabled: true,
        reminder_days: 7,
        theme: 'light',
      });
    }

    // PUT /api/user/settings
    if (req.method === 'PUT' && path === 'settings') {
      const { user_id, ...settings } = req.body;
      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }
      const { data, error } = await supabaseAdmin
        .from('user_settings')
        .upsert([{ user_id, ...settings, updated_at: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('User API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
