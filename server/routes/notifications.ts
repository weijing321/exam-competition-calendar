/**
 * 通知相关 API 路由
 */

import { Router, Request, Response } from 'express';
import * as db from '../db/notifications.ts';

const router = Router();

// GET /api/notifications - 获取所有通知
router.get('/', async (_req: Request, res: Response) => {
  try {
    const notifications = await db.getAllNotifications();
    const unreadCount = await db.getUnreadCount();
    res.json({ success: true, data: notifications, unreadCount });
  } catch (error: any) {
    console.error('获取通知列表失败:', error.message);
    res.status(500).json({ success: false, error: '获取通知列表失败' });
  }
});

// GET /api/notifications/unread-count - 获取未读数量
router.get('/unread-count', async (_req: Request, res: Response) => {
  try {
    const count = await db.getUnreadCount();
    res.json({ success: true, unreadCount: count });
  } catch (error: any) {
    console.error('获取未读通知数失败:', error.message);
    res.status(500).json({ success: false, error: '获取未读通知数失败' });
  }
});

// PATCH /api/notifications/:id/read - 标记单条已读
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    await db.markAsRead(req.params.id);
    res.json({ success: true, message: '已标记为已读' });
  } catch (error: any) {
    console.error('标记已读失败:', error.message);
    res.status(500).json({ success: false, error: '标记已读失败' });
  }
});

// PATCH /api/notifications/read-all - 全部标记已读
router.patch('/read-all', async (_req: Request, res: Response) => {
  try {
    await db.markAllAsRead();
    res.json({ success: true, message: '全部标记为已读' });
  } catch (error: any) {
    console.error('全部标记已读失败:', error.message);
    res.status(500).json({ success: false, error: '全部标记已读失败' });
  }
});

export default router;
