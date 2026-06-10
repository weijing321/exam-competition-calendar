/**
 * 考试相关 API 路由
 */

import { Router, Request, Response } from 'express';
import * as db from '../db/exams.ts';

const router = Router();

// GET /api/exams - 获取所有考试（支持分类筛选）
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    
    let exams;
    if (category) {
      exams = await db.getExamsByCategory(category);
    } else {
      exams = await db.getAllExams();
    }
    
    res.json({ success: true, data: exams });
  } catch (error: any) {
    console.error('获取考试列表失败:', error.message);
    res.status(500).json({ success: false, error: '获取考试列表失败' });
  }
});

// GET /api/exams/search - 搜索考试
router.get('/search', async (req: Request, res: Response) => {
  try {
    const keyword = req.query.q as string;
    if (!keyword) {
      return res.json({ success: true, data: [] });
    }
    const exams = await db.searchExams(keyword);
    res.json({ success: true, data: exams });
  } catch (error: any) {
    console.error('搜索考试失败:', error.message);
    res.status(500).json({ success: false, error: '搜索考试失败' });
  }
});

// GET /api/exams/:id - 获取单个考试
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const exam = await db.getExamById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, error: '考试不存在' });
    }
    res.json({ success: true, data: exam });
  } catch (error: any) {
    console.error('获取考试详情失败:', error.message);
    res.status(500).json({ success: false, error: '获取考试详情失败' });
  }
});

// POST /api/exams - 新增自定义考试
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, level, category, date, requirement } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: '考试名称不能为空' });
    }
    const exam = await db.createExam({ title, level, category, date, requirement });
    res.status(201).json({ success: true, data: exam });
  } catch (error: any) {
    console.error('新增考试失败:', error.message);
    res.status(500).json({ success: false, error: '新增考试失败' });
  }
});

export default router;
