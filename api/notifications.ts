/**
 * /api/notifications/* 路由
 */

import { supabase, jsonResponse, handleOptions } from './_utils.ts';

export default async function handler(req: any) {
  if (req.method === 'OPTIONS') return handleOptions();

  const url = new URL(req.url);
  const path = url.pathname.replace('/api/notifications', '').replace(/^\//, '');

  try {
    // GET /api/notifications
    if (req.method === 'GET' && !path) {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false);
      return jsonResponse({ success: true, data: data.map(formatNotification), unreadCount: count || 0 });
    }

    // GET /api/notifications/unread-count
    if (req.method === 'GET' && path === 'unread-count') {
      const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false);
      if (error) throw error;
      return jsonResponse({ success: true, unreadCount: count || 0 });
    }

    // PATCH /api/notifications/:id/read
    if (req.method === 'PATCH' && path.endsWith('/read')) {
      const id = path.replace('/read', '');
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      return jsonResponse({ success: true, message: '已标记为已读' });
    }

    // PATCH /api/notifications/read-all
    if (req.method === 'PATCH' && path === 'read-all') {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      if (error) throw error;
      return jsonResponse({ success: true, message: '全部标记为已读' });
    }

    return jsonResponse({ success: false, error: 'Not found' }, 404);
  } catch (error: any) {
    console.error('notifications error:', error.message);
    return jsonResponse({ success: false, error: error.message || '服务器错误' }, 500);
  }
}

function formatNotification(item: any) {
  return { id: item.id, title: item.title, time: item.time, is_read: item.is_read, created_at: item.created_at };
}
