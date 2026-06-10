/**
 * 竞赛相关 API 路由
 */

import { Router, Request, Response } from 'express';
import * as db from '../db/competitions.ts';

const router = Router();

// GET /api/competitions - 获取所有竞赛（支持分类筛选）
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const status = req.query.status as string;
    
    let competitions;
    if (status && ['open', 'closed', 'upcoming'].includes(status)) {
      competitions = await db.getCompetitionsByStatus(status as 'open' | 'closed' | 'upcoming');
    } else if (category) {
      competitions = await db.getCompetitionsByCategory(category);
    } else {
      competitions = await db.getAllCompetitions();
    }
    
    res.json({ success: true, data: competitions });
  } catch (error: any) {
    console.error('获取竞赛列表失败:', error.message);
    res.status(500).json({ success: false, error: '获取竞赛列表失败' });
  }
});

// GET /api/competitions/deadline - 获取即将截止的竞赛
router.get('/deadline', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const competitions = await db.getDeadlineCompetitions(days);
    res.json({ success: true, data: competitions });
  } catch (error: any) {
    console.error('获取截止竞赛失败:', error.message);
    res.status(500).json({ success: false, error: '获取截止竞赛失败' });
  }
});

// GET /api/competitions/search - 搜索竞赛
router.get('/search', async (req: Request, res: Response) => {
  try {
    const keyword = req.query.q as string;
    if (!keyword) {
      return res.json({ success: true, data: [] });
    }
    const competitions = await db.searchCompetitions(keyword);
    res.json({ success: true, data: competitions });
  } catch (error: any) {
    console.error('搜索竞赛失败:', error.message);
    res.status(500).json({ success: false, error: '搜索竞赛失败' });
  }
});

// GET /api/competitions/:id - 获取单个竞赛
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const competition = await db.getCompetitionById(req.params.id);
    if (!competition) {
      return res.status(404).json({ success: false, error: '竞赛不存在' });
    }
    res.json({ success: true, data: competition });
  } catch (error: any) {
    console.error('获取竞赛详情失败:', error.message);
    res.status(500).json({ success: false, error: '获取竞赛详情失败' });
  }
});

// POST /api/competitions - 新增自定义竞赛
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, level, category, degree, deadline } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: '竞赛名称不能为空' });
    }
    const competition = await db.createCompetition({ title, level, category, degree, deadline });
    res.status(201).json({ success: true, data: competition });
  } catch (error: any) {
    console.error('新增竞赛失败:', error.message);
    res.status(500).json({ success: false, error: '新增竞赛失败' });
  }
});

export default router;
