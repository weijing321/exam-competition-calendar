/**
 * /api/user/* 路由
 */

import { supabase, jsonResponse, handleOptions, getUserId } from './_utils';

export default async function handler(req: any) {
  if (req.method === 'OPTIONS') return handleOptions();

  const url = new URL(req.url);
  const path = url.pathname.replace('/api/user', '').replace(/^\//, '');
  const userId = getUserId(req);

  try {
    // ========== 收藏 ==========
    if (path === 'favorites' && req.method === 'GET') {
      if (!userId) return jsonResponse({ success: false, error: '请先登录' }, 401);
      const { data, error } = await supabase.from('favorites').select(`id, created_at, competition:competitions(*), exam:exams(*)`).eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (path === 'favorites/count' && req.method === 'GET') {
      if (!userId) return jsonResponse({ success: true, count: 0 });
      const { count, error } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId);
      if (error) throw error;
      return jsonResponse({ success: true, count: count || 0 });
    }

    if (path === 'favorites' && req.method === 'POST') {
      if (!userId) return jsonResponse({ success: false, error: '请先登录' }, 401);
      const body = await req.json();
      const { error } = await supabase.from('favorites').insert({ user_id: userId, competition_id: body.competitionId || null, exam_id: body.examId || null });
      if (error) throw error;
      return jsonResponse({ success: true, message: '已添加收藏' });
    }

    if (path === 'favorites' && req.method === 'DELETE') {
      if (!userId) return jsonResponse({ success: false, error: '请先登录' }, 401);
      const body = await req.json();
      let query = supabase.from('favorites').delete().eq('user_id', userId);
      if (body.competitionId) query = query.eq('competition_id', body.competitionId);
      else if (body.examId) query = query.eq('exam_id', body.examId);
      const { error } = await query;
      if (error) throw error;
      return jsonResponse({ success: true, message: '已取消收藏' });
    }

    if (path === 'favorites/check' && req.method === 'GET') {
      if (!userId) return jsonResponse({ success: true, isFavorited: false });
      const competitionId = url.searchParams.get('competitionId');
      const examId = url.searchParams.get('examId');
      let query = supabase.from('favorites').select('id').eq('user_id', userId);
      if (competitionId) query = query.eq('competition_id', competitionId);
      else if (examId) query = query.eq('exam_id', examId);
      const { data, error } = await query;
      if (error) throw error;
      return jsonResponse({ success: true, isFavorited: (data?.length || 0) > 0 });
    }

    // ========== 提醒 ==========
    if (path === 'reminders' && req.method === 'GET') {
      if (!userId) return jsonResponse({ success: false, error: '请先登录' }, 401);
      const { data, error } = await supabase.from('reminders').select(`id, remind_at, is_active, created_at, competition:competitions(*), exam:exams(*)`).eq('user_id', userId).eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (path === 'reminders/count' && req.method === 'GET') {
      if (!userId) return jsonResponse({ success: true, count: 0 });
      const { count, error } = await supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_active', true);
      if (error) throw error;
      return jsonResponse({ success: true, count: count || 0 });
    }

    if (path === 'reminders' && req.method === 'POST') {
      if (!userId) return jsonResponse({ success: false, error: '请先登录' }, 401);
      const body = await req.json();
      const { error } = await supabase.from('reminders').insert({ user_id: userId, competition_id: body.competitionId || null, exam_id: body.examId || null, is_active: true });
      if (error) throw error;
      return jsonResponse({ success: true, message: '已添加提醒' });
    }

    if (path === 'reminders' && req.method === 'DELETE') {
      if (!userId) return jsonResponse({ success: false, error: '请先登录' }, 401);
      const body = await req.json();
      let query = supabase.from('reminders').delete().eq('user_id', userId);
      if (body.competitionId) query = query.eq('competition_id', body.competitionId);
      else if (body.examId) query = query.eq('exam_id', body.examId);
      const { error } = await query;
      if (error) throw error;
      return jsonResponse({ success: true, message: '已取消提醒' });
    }

    // ========== 设置 ==========
    if (path === 'settings' && req.method === 'GET') {
      if (!userId) return jsonResponse({ success: false, error: '请先登录' }, 401);
      const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
      if (error || !data) {
        const { data: newData, error: insertError } = await supabase.from('user_settings').insert({ user_id: userId, degree: 'undergrad', push_enabled: true }).select().single();
        if (insertError) throw insertError;
        return jsonResponse({ success: true, data: newData });
      }
      return jsonResponse({ success: true, data });
    }

    if (path === 'settings/degree' && req.method === 'PATCH') {
      if (!userId) return jsonResponse({ success: false, error: '请先登录' }, 401);
      const body = await req.json();
      if (!['undergrad', 'junior'].includes(body.degree)) return jsonResponse({ success: false, error: '学历偏好值无效' }, 400);
      const { error } = await supabase.from('user_settings').update({ degree: body.degree }).eq('user_id', userId);
      if (error) throw error;
      return jsonResponse({ success: true, message: '学历偏好已更新' });
    }

    if (path === 'settings/push' && req.method === 'PATCH') {
      if (!userId) return jsonResponse({ success: false, error: '请先登录' }, 401);
      const body = await req.json();
      const { error } = await supabase.from('user_settings').update({ push_enabled: body.pushEnabled }).eq('user_id', userId);
      if (error) throw error;
      return jsonResponse({ success: true, message: `推送已${body.pushEnabled ? '开启' : '关闭'}` });
    }

    return jsonResponse({ success: false, error: 'Not found' }, 404);
  } catch (error: any) {
    console.error('user error:', error.message);
    return jsonResponse({ success: false, error: error.message || '服务器错误' }, 500);
  }
}
