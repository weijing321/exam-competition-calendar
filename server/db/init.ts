/**
 * 数据库初始化脚本
 * 用于手动执行 SQL schema 或快速插入种子数据
 * 用法: npm run db:init
 */

import { supabaseAdmin } from '../config/supabase.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  console.log('🔧 开始初始化数据库...\n');

  // 读取 SQL schema 文件
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ 找不到 schema.sql 文件');
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    // 通过 Supabase SQL API 执行 schema
    const { error } = await supabaseAdmin.rpc('exec_sql', { query: sql });
    
    if (error) {
      // exec_sql 可能不可用，改用直接执行
      console.log('⚠️  exec_sql RPC 不可用，请手动在 Supabase SQL Editor 中执行 server/db/schema.sql');
      console.log(`📄 Schema 文件路径: ${schemaPath}`);
    } else {
      console.log('✅ 数据库初始化成功！');
    }
  } catch (err: any) {
    console.log('💡 请通过以下方式初始化数据库：');
    console.log('   1. 打开 Supabase Dashboard -> SQL Editor');
    console.log('   2. 复制 server/db/schema.sql 的全部内容');
    console.log('   3. 粘贴到 SQL Editor 中执行\n');
    console.log(`📄 Schema 文件路径: ${schemaPath}`);
  }
}

initDatabase().catch(console.error);
