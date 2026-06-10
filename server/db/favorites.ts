/**
 * 数据库操作层 - Favorites & Reminders & User Settings
 */

import { supabase } from '../config/supabase.ts';

// ========== 收藏 (Favorites) ==========

export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      competition:competitions(*),
      exam:exams(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getFavoriteCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return count || 0;
}

export async function addFavorite(userId: string, competitionId?: string, examId?: string) {
  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      competition_id: competitionId || null,
      exam_id: examId || null,
    });

  if (error) throw error;
}

export async function removeFavorite(userId: string, competitionId?: string, examId?: string) {
  let query = supabase.from('favorites').delete().eq('user_id', userId);
  
  if (competitionId) {
    query = query.eq('competition_id', competitionId);
  } else if (examId) {
    query = query.eq('exam_id', examId);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function isFavorited(userId: string, competitionId?: string, examId?: string): Promise<boolean> {
  let query = supabase.from('favorites').select('id').eq('user_id', userId);
  
  if (competitionId) {
    query = query.eq('competition_id', competitionId);
  } else if (examId) {
    query = query.eq('exam_id', examId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data?.length || 0) > 0;
}

// ========== 提醒 (Reminders) ==========

export async function getUserReminders(userId: string) {
  const { data, error } = await supabase
    .from('reminders')
    .select(`
      id,
      remind_at,
      is_active,
      created_at,
      competition:competitions(*),
      exam:exams(*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getReminderCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) throw error;
  return count || 0;
}

export async function addReminder(userId: string, competitionId?: string, examId?: string) {
  const { error } = await supabase
    .from('reminders')
    .insert({
      user_id: userId,
      competition_id: competitionId || null,
      exam_id: examId || null,
      is_active: true,
    });

  if (error) throw error;
}

export async function removeReminder(userId: string, competitionId?: string, examId?: string) {
  let query = supabase.from('reminders').delete().eq('user_id', userId);
  
  if (competitionId) {
    query = query.eq('competition_id', competitionId);
  } else if (examId) {
    query = query.eq('exam_id', examId);
  }

  const { error } = await query;
  if (error) throw error;
}

// ========== 用户设置 (User Settings) ==========

export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 如果不存在则创建默认设置
  if (error || !data) {
    const { data: newData, error: insertError } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        degree: 'undergrad',
        push_enabled: true,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newData;
  }

  return data;
}

export async function updateDegree(userId: string, degree: 'undergrad' | 'junior') {
  const { error } = await supabase
    .from('user_settings')
    .update({ degree })
    .eq('user_id', userId);

  if (error) throw error;
}

export async function togglePush(userId: string, pushEnabled: boolean) {
  const { error } = await supabase
    .from('user_settings')
    .update({ push_enabled: pushEnabled })
    .eq('user_id', userId);

  if (error) throw error;
}
