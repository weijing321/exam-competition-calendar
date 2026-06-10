/**
 * 数据库操作层 - Notifications
 */

import { supabase } from '../config/supabase.ts';

export interface Notification {
  id: string;
  title: string;
  time: string;
  is_read: boolean;
  created_at?: string;
}

// 获取所有通知（按时间倒序）
export async function getAllNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(formatNotification);
}

// 获取未读通知数
export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

// 标记通知为已读
export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
}

// 标记所有通知为已读
export async function markAllAsRead(): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) throw error;
}

function formatNotification(item: any): Notification {
  return {
    id: item.id,
    title: item.title,
    time: item.time,
    is_read: item.is_read,
    created_at: item.created_at,
  };
}
