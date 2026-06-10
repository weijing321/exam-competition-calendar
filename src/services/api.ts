/**
 * 前端 API 服务层
 * 直接连接 Supabase 数据库，不经过后端 API
 */

import { createClient } from '@supabase/supabase-js';
import type { Competition, Exam, Notification } from '../types';

// Supabase 客户端 - 使用 ANON_KEY（公开可安全暴露在前端）
const supabaseUrl = 'https://adatntxsyzownxurkdxc.supabase.co';
const supabaseAnonKey = 'sb_publishable_Ba0sEQEcKnaGI0gKnrAJ4A_iWiwG-yN';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== 竞赛 API ====================

export async function fetchCompetitions(category?: string): Promise<Competition[]> {
  let query = supabase.from('competitions').select('*');
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(mapCompetition);
}

export async function fetchDeadlineCompetitions(days = 7): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .not('deadline', 'eq', '不限时间')
    .not('deadline', 'eq', '已结束')
    .order('days_remaining', { ascending: true })
    .limit(10);
  if (error) throw new Error(error.message);
  return (data || []).map(mapCompetition);
}

export async function fetchCompetitionById(id: string): Promise<Competition | null> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data ? mapCompetition(data) : null;
}

export async function searchCompetitions(keyword: string): Promise<Competition[]> {
  const { data, error } = await supabase
    .from('competitions')
    .select('*')
    .or(`title.ilike.%${keyword}%,category.ilike.%${keyword}%`);
  if (error) throw new Error(error.message);
  return (data || []).map(mapCompetition);
}

export async function createCompetition(params: {
  title: string;
  level?: string;
  category?: string;
  degree?: string;
  deadline?: string;
}): Promise<Competition> {
  const { data, error } = await supabase
    .from('competitions')
    .insert([{
      title: params.title,
      level: params.level || '',
      category: params.category || '',
      degree: params.degree || '',
      deadline: params.deadline || '',
      registration_status: 'upcoming',
    }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapCompetition(data);
}

// ==================== 考试 API ====================

export async function fetchExams(category?: string): Promise<Exam[]> {
  let query = supabase.from('exams').select('*');
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(mapExam);
}

export async function fetchExamById(id: string): Promise<Exam | null> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data ? mapExam(data) : null;
}

export async function searchExams(keyword: string): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .or(`title.ilike.%${keyword}%,category.ilike.%${keyword}%`);
  if (error) throw new Error(error.message);
  return (data || []).map(mapExam);
}

export async function createExam(params: {
  title: string;
  level?: string;
  category?: string;
  date?: string;
  requirement?: string;
}): Promise<Exam> {
  const { data, error } = await supabase
    .from('exams')
    .insert([{
      title: params.title,
      level: params.level || '',
      category: params.category || '',
      date: params.date || '',
      requirement: params.requirement || '',
      window_status: 'normal',
    }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapExam(data);
}

// ==================== 通知 API ====================

export async function fetchNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const items = (data || []).map(mapNotification);
  const unreadCount = items.filter(n => !n.isRead).length;
  return { notifications: items, unreadCount };
}

export async function fetchUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);
  if (error) throw new Error(error.message);
  return count || 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);
  if (error) throw new Error(error.message);
}

// ==================== 用户收藏 API ====================

export async function fetchFavorites(): Promise<any[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchFavoriteCount(): Promise<number> {
  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

export async function addFavorite(competitionId?: string, examId?: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert([{ competition_id: competitionId, exam_id: examId }]);
  if (error) throw new Error(error.message);
}

export async function removeFavorite(competitionId?: string, examId?: string): Promise<void> {
  let query = supabase.from('favorites').delete();
  if (competitionId) query = query.eq('competition_id', competitionId);
  if (examId) query = query.eq('exam_id', examId);
  const { error } = await query;
  if (error) throw new Error(error.message);
}

export async function checkFavorited(competitionId?: string, examId?: string): Promise<boolean> {
  let query = supabase.from('favorites').select('*', { count: 'exact', head: true });
  if (competitionId) query = query.eq('competition_id', competitionId);
  if (examId) query = query.eq('exam_id', examId);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

// ==================== 用户提醒 API ====================

export async function fetchReminders(): Promise<any[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchReminderCount(): Promise<number> {
  const { count, error } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

export async function addReminder(competitionId?: string, examId?: string): Promise<void> {
  const { error } = await supabase
    .from('reminders')
    .insert([{ competition_id: competitionId, exam_id: examId }]);
  if (error) throw new Error(error.message);
}

export async function removeReminder(competitionId?: string, examId?: string): Promise<void> {
  let query = supabase.from('reminders').delete();
  if (competitionId) query = query.eq('competition_id', competitionId);
  if (examId) query = query.eq('exam_id', examId);
  const { error } = await query;
  if (error) throw new Error(error.message);
}

// ==================== 用户设置 API ====================

export async function fetchUserSettings(): Promise<{ degree: string; push_enabled: boolean }> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || { degree: 'undergrad', push_enabled: true };
}

export async function updateDegree(degree: 'undergrad' | 'junior'): Promise<void> {
  const { error } = await supabase
    .from('user_settings')
    .upsert([{ degree, updated_at: new Date().toISOString() }]);
  if (error) throw new Error(error.message);
}

export async function togglePush(pushEnabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('user_settings')
    .upsert([{ push_enabled: pushEnabled, updated_at: new Date().toISOString() }]);
  if (error) throw new Error(error.message);
}

// ==================== 数据映射函数 ====================

function mapCompetition(item: any): Competition {
  return {
    id: item.id,
    title: item.title,
    level: item.level,
    category: item.category,
    tags: item.tags || [],
    status: item.status || '',
    registrationStatus: item.registration_status,
    degree: item.degree,
    channel: item.channel,
    deadline: item.deadline,
    daysRemaining: item.days_remaining,
  };
}

function mapExam(item: any): Exam {
  return {
    id: item.id,
    title: item.title,
    date: item.date,
    level: item.level,
    category: item.category,
    requirement: item.requirement || '',
    window: item.window || '',
    windowStatus: item.window_status,
  };
}

function mapNotification(item: any): Notification {
  return {
    id: item.id,
    title: item.title,
    time: item.time,
    isRead: item.is_read,
  };
}
