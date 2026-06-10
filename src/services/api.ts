/**
 * 前端 API 服务层
 * 统一管理所有与后端的 HTTP 通信
 */

import type { Competition, Exam, Notification } from '../types';

// 开发环境通过 Vite proxy 代理到后端，生产环境直接使用同源 /api
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// 通用请求函数
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      // Demo 模式下使用默认用户ID（后续可替换为真实认证token）
      'x-user-id': 'demo-user-001',
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ==================== 竞赛 API ====================

export async function fetchCompetitions(category?: string): Promise<Competition[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await request<{ success: boolean; data: any[] }>(`/competitions${params}`);
  return res.data.map(mapCompetition);
}

export async function fetchDeadlineCompetitions(days = 7): Promise<Competition[]> {
  const res = await request<{ success: boolean; data: any[] }>(`/competitions/deadline?days=${days}`);
  return res.data.map(mapCompetition);
}

export async function fetchCompetitionById(id: string): Promise<Competition | null> {
  const res = await request<{ success: boolean; data: any }>(`/competitions/${id}`);
  return res.data ? mapCompetition(res.data) : null;
}

export async function searchCompetitions(keyword: string): Promise<Competition[]> {
  const res = await request<{ success: boolean; data: any[] }>(`/competitions/search?q=${encodeURIComponent(keyword)}`);
  return res.data.map(mapCompetition);
}

export async function createCompetition(params: {
  title: string;
  level?: string;
  category?: string;
  degree?: string;
  deadline?: string;
}): Promise<Competition> {
  const res = await request<{ success: boolean; data: any }>('/competitions', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return mapCompetition(res.data);
}

// ==================== 考试 API ====================

export async function fetchExams(category?: string): Promise<Exam[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await request<{ success: boolean; data: any[] }>(`/exams${params}`);
  return res.data.map(mapExam);
}

export async function fetchExamById(id: string): Promise<Exam | null> {
  const res = await request<{ success: boolean; data: any }>(`/exams/${id}`);
  return res.data ? mapExam(res.data) : null;
}

export async function searchExams(keyword: string): Promise<Exam[]> {
  const res = await request<{ success: boolean; data: any[] }>(`/exams/search?q=${encodeURIComponent(keyword)}`);
  return res.data.map(mapExam);
}

export async function createExam(params: {
  title: string;
  level?: string;
  category?: string;
  date?: string;
  requirement?: string;
}): Promise<Exam> {
  const res = await request<{ success: boolean; data: any }>('/exams', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return mapExam(res.data);
}

// ==================== 通知 API ====================

export async function fetchNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const res = await request<{ success: boolean; data: any[]; unreadCount: number }>('/notifications');
  return {
    notifications: res.data.map(mapNotification),
    unreadCount: res.unreadCount,
  };
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await request<{ success: boolean; unreadCount: number }>('/notifications/unread-count');
  return res.unreadCount;
}

export async function markNotificationRead(id: string): Promise<void> {
  await request(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await request('/notifications/read-all', { method: 'PATCH' });
}

// ==================== 用户收藏 API ====================

export async function fetchFavorites(): Promise<any[]> {
  const res = await request<{ success: boolean; data: any[] }>('/user/favorites');
  return res.data;
}

export async function fetchFavoriteCount(): Promise<number> {
  const res = await request<{ success: boolean; count: number }>('/user/favorites/count');
  return res.count;
}

export async function addFavorite(competitionId?: string, examId?: string): Promise<void> {
  await request('/user/favorites', {
    method: 'POST',
    body: JSON.stringify({ competitionId, examId }),
  });
}

export async function removeFavorite(competitionId?: string, examId?: string): Promise<void> {
  await request('/user/favorites', {
    method: 'DELETE',
    body: JSON.stringify({ competitionId, examId }),
  });
}

export async function checkFavorited(competitionId?: string, examId?: string): Promise<boolean> {
  const params = new URLSearchParams();
  if (competitionId) params.set('competitionId', competitionId);
  if (examId) params.set('examId', examId);
  const res = await request<{ success: boolean; isFavorited: boolean }>(`/user/favorites/check?${params}`);
  return res.isFavorited;
}

// ==================== 用户提醒 API ====================

export async function fetchReminders(): Promise<any[]> {
  const res = await request<{ success: boolean; data: any[] }>('/user/reminders');
  return res.data;
}

export async function fetchReminderCount(): Promise<number> {
  const res = await request<{ success: boolean; count: number }>('/user/reminders/count');
  return res.count;
}

export async function addReminder(competitionId?: string, examId?: string): Promise<void> {
  await request('/user/reminders', {
    method: 'POST',
    body: JSON.stringify({ competitionId, examId }),
  });
}

export async function removeReminder(competitionId?: string, examId?: string): Promise<void> {
  await request('/user/reminders', {
    method: 'DELETE',
    body: JSON.stringify({ competitionId, examId }),
  });
}

// ==================== 用户设置 API ====================

export async function fetchUserSettings(): Promise<{ degree: string; push_enabled: boolean }> {
  const res = await request<{ success: boolean; data: any }>('/user/settings');
  return res.data;
}

export async function updateDegree(degree: 'undergrad' | 'junior'): Promise<void> {
  await request('/user/settings/degree', {
    method: 'PATCH',
    body: JSON.stringify({ degree }),
  });
}

export async function togglePush(pushEnabled: boolean): Promise<void> {
  await request('/user/settings/push', {
    method: 'PATCH',
    body: JSON.stringify({ pushEnabled }),
  });
}

// ==================== 数据映射函数 ====================
// 将数据库字段（snake_case）转为前端字段（camelCase）

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
