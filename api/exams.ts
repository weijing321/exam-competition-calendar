/**
 * /api/exams/* 路由
 */

import { supabase, jsonResponse, handleOptions } from './_utils.ts';

export default async function handler(req: any) {
  if (req.method === 'OPTIONS') return handleOptions();

  const url = new URL(req.url);
  const path = url.pathname.replace('/api/exams', '').replace(/^\//, '');

  try {
    // GET /api/exams
    if (req.method === 'GET' && !path) {
      const category = url.searchParams.get('category');
      let query = supabase.from('exams').select('*');
      if (category && category !== '全部') {
        query = query.eq('category', category);
      }
      const { data, error } = await query.order('date', { ascending: true });
      if (error) throw error;
      return jsonResponse({ success: true, data: data.map(formatExam) });
    }

    // GET /api/exams/search
    if (req.method === 'GET' && path === 'search') {
      const keyword = url.searchParams.get('q');
      if (!keyword) return jsonResponse({ success: true, data: [] });
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .or(`title.ilike.%${keyword}%,category.ilike.%${keyword}%,level.ilike.%${keyword}%`)
        .order('date', { ascending: true });
      if (error) throw error;
      return jsonResponse({ success: true, data: data.map(formatExam) });
    }

    // GET /api/exams/:id
    if (req.method === 'GET' && path && !path.includes('/')) {
      const { data, error } = await supabase.from('exams').select('*').eq('id', path).single();
      if (error) return jsonResponse({ success: false, error: '考试不存在' }, 404);
      return jsonResponse({ success: true, data: formatExam(data) });
    }

    // POST /api/exams
    if (req.method === 'POST' && !path) {
      const body = await req.json();
      const { title, level, category, date, requirement } = body;
      if (!title) return jsonResponse({ success: false, error: '考试名称不能为空' }, 400);
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabase.from('exams').insert({
        id, title, level: level || '自定义', category: category || '其他',
        date: date || '', requirement: requirement || '', window: '', window_status: 'normal',
      }).select().single();
      if (error) throw error;
      return jsonResponse({ success: true, data: formatExam(data) }, 201);
    }

    return jsonResponse({ success: false, error: 'Not found' }, 404);
  } catch (error: any) {
    console.error('exams error:', error.message);
    return jsonResponse({ success: false, error: error.message || '服务器错误' }, 500);
  }
}

function formatExam(item: any) {
  return {
    id: item.id, title: item.title, date: item.date, level: item.level,
    category: item.category, requirement: item.requirement || '',
    window: item.window || '', window_status: item.window_status,
    created_at: item.created_at, updated_at: item.updated_at,
  };
}
