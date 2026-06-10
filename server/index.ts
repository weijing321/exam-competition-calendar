/**
 * 考赛日历 - 后端服务器入口
 * Express + Supabase 全栈应用
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 先加载 .env（必须在其他导入之前）
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { validateSupabaseConfig } from './config/supabase.ts';

// 路由
import competitionRoutes from './routes/competitions.ts';
import examRoutes from './routes/exams.ts';
import notificationRoutes from './routes/notifications.ts';
import userRoutes from './routes/user.ts';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 请求日志
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API 路由
app.use('/api/competitions', competitionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', userRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  const config = validateSupabaseConfig();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: config.valid ? 'connected' : 'misconfigured',
  });
});

// 在生产环境下托管前端静态文件
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback：所有非 API 路径返回 index.html
app.get(/^\/(?!api\/).*/, (_req, res) => {
  const filePath = path.join(distPath, 'index.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 考赛日历后端服务器已启动`);
  console.log(`📡 API 地址: http://localhost:${PORT}/api`);
  console.log(`💚 健康检查: http://localhost:${PORT}/api/health\n`);
  
  const config = validateSupabaseConfig();
  if (!config.valid) {
    console.warn('⚠️  Supabase 配置不完整，请检查 .env 文件:');
    console.warn(`   缺少: ${config.missing.join(', ')}\n`);
  } else {
    console.log('✅ Supabase 已连接\n');
  }
});
