/**
 * 数据库操作层 - Competitions
 */

import { supabase } from '../config/supabase.ts';

export interface Competition {
  id: string;
  title: string;
  level: string;
  category: string;
  tags: string[];
  status: string;
  registration_status: 'open' | 'closed' | 'upcoming';
  degree?: string;
  channel?: string;
  deadline?: string;
  days_remaining?: number;
  created_at?: string;
  updated_at?: string;
}

// 获取所有竞赛
export async function getAllCompetitions(): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(formatCompetition);
}

// 按分类筛选竞赛
export async function getCompetitionsByCategory(category: string): Promise<Competition[]> {
  let query = supabase.from('competitions').select('*');
  
  if (category !== '全部') {
    if (category === '职业技能') {
      query = query.contains('tags', ['职业技能']);
    } else {
      query = query.eq('category', category);
    }
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(formatCompetition);
}

// 按报名状态筛选竞赛
export async function getCompetitionsByStatus(status: 'open' | 'closed' | 'upcoming'): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('registration_status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(formatCompetition);
}

// 获取近N天截止的竞赛（用北京时间动态计算）
export async function getDeadlineCompetitions(days: number = 7): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('registration_status', 'open');

  if (error) throw error;

  // 动态计算 days_remaining，只返回 <= days 的
  return data
    .map(formatCompetition)
    .filter(c => c.days_remaining != null && c.days_remaining <= days)
    .sort((a, b) => (a.days_remaining ?? 999) - (b.days_remaining ?? 999));
}

// 获取单个竞赛详情
export async function getCompetitionById(id: string): Promise<Competition | null> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return formatCompetition(data);
}

// 搜索竞赛
export async function searchCompetitions(keyword: string): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .or(`title.ilike.%${keyword}%,category.ilike.%${keyword}%,level.ilike.%${keyword}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(formatCompetition);
}

// 新增自定义竞赛
export async function createCompetition(params: {
  title: string;
  level?: string;
  category?: string;
  degree?: string;
  deadline?: string;
}): Promise<Competition> {
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase
    .from('competitions')
    .insert({
      id,
      title: params.title,
      level: params.level || '自定义',
      category: params.category || '其他',
      tags: [],
      status: '自定义',
      registration_status: 'open',
      degree: params.degree || '',
      channel: '自定义添加',
      deadline: params.deadline || '',
    })
    .select()
    .single();

  if (error) throw error;
  return formatCompetition(data);
}

// 用北京时间计算截止日期剩余天数
function calcDaysRemaining(deadline: string | undefined): number | null {
  if (!deadline || deadline === '不限时间' || deadline === '已结束' || deadline.includes('每期截止时间不同') || deadline.includes('请关注官网')) {
    return null;
  }
  // deadline 格式: "2026.06.30" 或 "2026.06.05"
  const match = deadline.match(/(\d{4})[./年](\d{1,2})[./月](\d{1,2})/);
  if (!match) return null;

  const deadlineDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  // 用北京时间
  const bjNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
  bjNow.setHours(0, 0, 0, 0);

  const diffMs = deadlineDate.getTime() - bjNow.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days >= 0 ? days : null;
}

// 格式化：将数据库字段转为前端字段
function formatCompetition(item: any): Competition {
  const deadline = item.deadline || undefined;
  return {
    id: item.id,
    title: item.title,
    level: item.level,
    category: item.category,
    tags: item.tags || [],
    status: item.status || '',
    registration_status: item.registration_status,
    degree: item.degree || undefined,
    channel: item.channel || undefined,
    deadline: deadline,
    days_remaining: calcDaysRemaining(deadline),
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}
