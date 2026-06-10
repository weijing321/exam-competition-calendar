/**
 * 用户相关 API 路由 - 收藏、提醒、设置
 */

import { Router, Request, Response } from 'express';
import * as db from '../db/favorites.ts';

const router = Router();

// 获取当前用户ID的中间件（简化版，实际应从auth token中提取）
function getUserId(req: Request): string | null {
  // 优先从 header 获取，兼容 demo 模式
  const userId = req.headers['x-user-id'] as string;
  return userId || null;
}

// ========== 收藏 (Favorites) ==========

// GET /api/user/favorites - 获取收藏列表
router.get('/favorites', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }
    const favorites = await db.getUserFavorites(userId);
    res.json({ success: true, data: favorites });
  } catch (error: any) {
    console.error('获取收藏失败:', error.message);
    res.status(500).json({ success: false, error: '获取收藏失败' });
  }
});

// GET /api/user/favorites/count - 获取收藏数
router.get('/favorites/count', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.json({ success: true, count: 0 });
    }
    const count = await db.getFavoriteCount(userId);
    res.json({ success: true, count });
  } catch (error: any) {
    console.error('获取收藏数失败:', error.message);
    res.status(500).json({ success: false, error: '获取收藏数失败' });
  }
});

// POST /api/user/favorites - 添加收藏
router.post('/favorites', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }
    const { competitionId, examId } = req.body;
    await db.addFavorite(userId, competitionId, examId);
    res.json({ success: true, message: '已添加收藏' });
  } catch (error: any) {
    console.error('添加收藏失败:', error.message);
    res.status(500).json({ success: false, error: '添加收藏失败' });
  }
});

// DELETE /api/user/favorites - 取消收藏
router.delete('/favorites', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }
    const { competitionId, examId } = req.body;
    await db.removeFavorite(userId, competitionId, examId);
    res.json({ success: true, message: '已取消收藏' });
  } catch (error: any) {
    console.error('取消收藏失败:', error.message);
    res.status(500).json({ success: false, error: '取消收藏失败' });
  }
});

// GET /api/user/favorites/check - 检查是否已收藏
router.get('/favorites/check', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.json({ success: true, isFavorited: false });
    }
    const competitionId = req.query.competitionId as string;
    const examId = req.query.examId as string;
    const result = await db.isFavorited(userId, competitionId, examId);
    res.json({ success: true, isFavorited: result });
  } catch (error: any) {
    console.error('检查收藏状态失败:', error.message);
    res.status(500).json({ success: false, error: '检查收藏状态失败' });
  }
});

// ========== 提醒 (Reminders) ==========

// GET /api/user/reminders - 获取提醒列表
router.get('/reminders', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }
    const reminders = await db.getUserReminders(userId);
    res.json({ success: true, data: reminders });
  } catch (error: any) {
    console.error('获取提醒失败:', error.message);
    res.status(500).json({ success: false, error: '获取提醒失败' });
  }
});

// GET /api/user/reminders/count - 获取提醒数
router.get('/reminders/count', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.json({ success: true, count: 0 });
    }
    const count = await db.getReminderCount(userId);
    res.json({ success: true, count });
  } catch (error: any) {
    console.error('获取提醒数失败:', error.message);
    res.status(500).json({ success: false, error: '获取提醒数失败' });
  }
});

// POST /api/user/reminders - 添加提醒
router.post('/reminders', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }
    const { competitionId, examId } = req.body;
    await db.addReminder(userId, competitionId, examId);
    res.json({ success: true, message: '已添加提醒' });
  } catch (error: any) {
    console.error('添加提醒失败:', error.message);
    res.status(500).json({ success: false, error: '添加提醒失败' });
  }
});

// DELETE /api/user/reminders - 取消提醒
router.delete('/reminders', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }
    const { competitionId, examId } = req.body;
    await db.removeReminder(userId, competitionId, examId);
    res.json({ success: true, message: '已取消提醒' });
  } catch (error: any) {
    console.error('取消提醒失败:', error.message);
    res.status(500).json({ success: false, error: '取消提醒失败' });
  }
});

// ========== 用户设置 (Settings) ==========

// GET /api/user/settings - 获取用户设置
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }
    const settings = await db.getUserSettings(userId);
    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('获取用户设置失败:', error.message);
    res.status(500).json({ success: false, error: '获取用户设置失败' });
  }
});

// PATCH /api/user/settings/degree - 更新学历偏好
router.patch('/settings/degree', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }
    const { degree } = req.body;
    if (!['undergrad', 'junior'].includes(degree)) {
      return res.status(400).json({ success: false, error: '学历偏好值无效' });
    }
    await db.updateDegree(userId, degree);
    res.json({ success: true, message: '学历偏好已更新' });
  } catch (error: any) {
    console.error('更新学历偏好失败:', error.message);
    res.status(500).json({ success: false, error: '更新学历偏好失败' });
  }
});

// PATCH /api/user/settings/push - 切换推送开关
router.patch('/settings/push', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: '请先登录' });
    }
    const { pushEnabled } = req.body;
    await db.togglePush(userId, pushEnabled);
    res.json({ success: true, message: `推送已${pushEnabled ? '开启' : '关闭'}` });
  } catch (error: any) {
    console.error('切换推送失败:', error.message);
    res.status(500).json({ success: false, error: '切换推送失败' });
  }
});

export default router;
