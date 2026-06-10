/**
 * 数据库操作层 - Exams
 */

import { supabase } from '../config/supabase.ts';

export interface Exam {
  id: string;
  title: string;
  date: string;
  level: string;
  category: string;
  requirement: string;
  window: string;
  window_status: 'normal' | 'ending' | 'closed';
  created_at?: string;
  updated_at?: string;
}

// 获取所有考试
export async function getAllExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return data.map(formatExam);
}

// 按分类筛选考试
export async function getExamsByCategory(category: string): Promise<Exam[]> {
  let query = supabase.from('exams').select('*');
  
  if (category !== '全部') {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('date', { ascending: true });
  if (error) throw error;
  return data.map(formatExam);
}

// 获取单个考试详情
export async function getExamById(id: string): Promise<Exam | null> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return formatExam(data);
}

// 搜索考试
export async function searchExams(keyword: string): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .or(`title.ilike.%${keyword}%,category.ilike.%${keyword}%,level.ilike.%${keyword}%`)
    .order('date', { ascending: true });

  if (error) throw error;
  return data.map(formatExam);
}

// 新增自定义考试
export async function createExam(params: {
  title: string;
  level?: string;
  category?: string;
  date?: string;
  requirement?: string;
}): Promise<Exam> {
  const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase
    .from('exams')
    .insert({
      id,
      title: params.title,
      level: params.level || '自定义',
      category: params.category || '其他',
      date: params.date || '',
      requirement: params.requirement || '',
      window: '',
      window_status: 'normal',
    })
    .select()
    .single();

  if (error) throw error;
  return formatExam(data);
}

function formatExam(item: any): Exam {
  return {
    id: item.id,
    title: item.title,
    date: item.date,
    level: item.level,
    category: item.category,
    requirement: item.requirement || '',
    window: item.window || '',
    window_status: item.window_status,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}
