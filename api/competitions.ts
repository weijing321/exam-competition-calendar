/**
 * /api/competitions/* 路由
 */

import { supabase, jsonResponse, handleOptions } from './_utils.ts';

export default async function handler(req: any) {
  if (req.method === 'OPTIONS') return handleOptions();

  const url = new URL(req.url);
  const path = url.pathname.replace('/api/competitions', '').replace(/^\//, '');

  try {
    // GET /api/competitions
    if (req.method === 'GET' && !path) {
      const category = url.searchParams.get('category');
      const status = url.searchParams.get('status');
      let query = supabase.from('competitions').select('*');

      if (status && ['open', 'closed', 'upcoming'].includes(status)) {
        query = query.eq('registration_status', status);
      } else if (category && category !== '全部') {
        if (category === '职业技能') {
          query = query.contains('tags', ['职业技能']);
        } else {
          query = query.eq('category', category);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return jsonResponse({ success: true, data: data.map(formatCompetition) });
    }

    // GET /api/competitions/deadline
    if (req.method === 'GET' && path === 'deadline') {
      const days = parseInt(url.searchParams.get('days') || '7');
      const { data, error } = await supabase.from('competitions').select('*').eq('registration_status', 'open');
      if (error) throw error;
      const result = data
        .map(formatCompetition)
        .filter((c: any) => c.days_remaining != null && c.days_remaining <= days)
        .sort((a: any, b: any) => (a.days_remaining ?? 999) - (b.days_remaining ?? 999));
      return jsonResponse({ success: true, data: result });
    }

    // GET /api/competitions/search
    if (req.method === 'GET' && path === 'search') {
      const keyword = url.searchParams.get('q');
      if (!keyword) return jsonResponse({ success: true, data: [] });
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .or(`title.ilike.%${keyword}%,category.ilike.%${keyword}%,level.ilike.%${keyword}%`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return jsonResponse({ success: true, data: data.map(formatCompetition) });
    }

    // GET /api/competitions/:id
    if (req.method === 'GET' && path && !path.includes('/')) {
      const { data, error } = await supabase.from('competitions').select('*').eq('id', path).single();
      if (error) return jsonResponse({ success: false, error: '竞赛不存在' }, 404);
      return jsonResponse({ success: true, data: formatCompetition(data) });
    }

    // POST /api/competitions
    if (req.method === 'POST' && !path) {
      const body = await req.json();
      const { title, level, category, degree, deadline } = body;
      if (!title) return jsonResponse({ success: false, error: '竞赛名称不能为空' }, 400);
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabase.from('competitions').insert({
        id, title, level: level || '自定义', category: category || '其他',
        tags: [], status: '自定义', registration_status: 'open',
        degree: degree || '', channel: '自定义添加', deadline: deadline || '',
      }).select().single();
      if (error) throw error;
      return jsonResponse({ success: true, data: formatCompetition(data) }, 201);
    }

    return jsonResponse({ success: false, error: 'Not found' }, 404);
  } catch (error: any) {
    console.error('competitions error:', error.message);
    return jsonResponse({ success: false, error: error.message || '服务器错误' }, 500);
  }
}

function calcDaysRemaining(deadline: string | undefined): number | null {
  if (!deadline || deadline === '不限时间' || deadline === '已结束' || deadline.includes('每期截止时间不同') || deadline.includes('请关注官网')) {
    return null;
  }
  const match = deadline.match(/(\d{4})[./年](\d{1,2})[./月](\d{1,2})/);
  if (!match) return null;
  const deadlineDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  const bjNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  bjNow.setHours(0, 0, 0, 0);
  const days = Math.ceil((deadlineDate.getTime() - bjNow.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 0 ? days : null;
}

function formatCompetition(item: any) {
  const deadline = item.deadline || undefined;
  return {
    id: item.id, title: item.title, level: item.level, category: item.category,
    tags: item.tags || [], status: item.status || '',
    registration_status: item.registration_status, degree: item.degree || undefined,
    channel: item.channel || undefined, deadline,
    days_remaining: calcDaysRemaining(deadline),
    created_at: item.created_at, updated_at: item.updated_at,
  };
}
