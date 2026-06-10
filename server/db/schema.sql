-- Supabase 数据库 Schema
-- 考赛日历 (Exam & Competition Calendar)

-- 竞赛/比赛表
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  level VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(100) DEFAULT '',
  registration_status VARCHAR(20) NOT NULL CHECK (registration_status IN ('open', 'closed', 'upcoming')),
  degree VARCHAR(100),
  channel VARCHAR(100),
  deadline VARCHAR(50),
  days_remaining INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 考试/证书表
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  date VARCHAR(50) NOT NULL,
  level VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  requirement VARCHAR(255),
  "window" VARCHAR(100),
  window_status VARCHAR(20) NOT NULL CHECK (window_status IN ('normal', 'ending', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  time VARCHAR(100) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_favorite_target CHECK (
    (competition_id IS NOT NULL AND exam_id IS NULL) OR
    (competition_id IS NULL AND exam_id IS NOT NULL)
  ),
  UNIQUE(user_id, competition_id),
  UNIQUE(user_id, exam_id)
);

-- 用户提醒表
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_reminder_target CHECK (
    (competition_id IS NOT NULL AND exam_id IS NULL) OR
    (competition_id IS NULL AND exam_id IS NOT NULL)
  ),
  UNIQUE(user_id, competition_id),
  UNIQUE(user_id, exam_id)
);

-- 用户偏好设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  degree VARCHAR(20) DEFAULT 'undergrad' CHECK (degree IN ('undergrad', 'junior')),
  push_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 competitions 和 exams 表添加更新时间触发器
CREATE TRIGGER trigger_competitions_updated_at
  BEFORE UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 插入初始数据
INSERT INTO competitions (title, level, category, tags, status, registration_status, degree, channel, deadline) VALUES
('中国国际大学生创新大赛', '国家级 A类', '创新创业', ARRAY['国家级 A类'], '报名中', 'open', '本科可报', '官网', '2024.03.20'),
('蓝桥杯全国软件和信息技术大赛', '国家级 A类', '计算机', ARRAY['国家级 A类'], '即将截止', 'open', '专科可报', '官网', '2023.12.01'),
('初级外贸业务员考试', '职业资格', '外贸', ARRAY['职业技能'], '未开始', 'upcoming', '不限', '官网', '2024.05.10'),
('全国大学生英语竞赛(NECCS)', '国家级 (B类)', '语言', ARRAY['国家级 B类'], '已结束', 'closed', '不限学历', '官网', '已结束'),
('网页设计师职业技能证书', '职业等级', '计算机', ARRAY['职业技能'], '报名中', 'open', '不限', '公众号', '2024.04.15'),
('国际商务单证员考试', '职业资格', '外贸', ARRAY['职业技能'], '已结束', 'closed', '本科', '官网', '2023.10.20'),
('华为认证ICT专家', '企业认证', '计算机', ARRAY['职业技能'], '常年预约', 'open', '不限', '官网', '不限时间'),
('全国大学生电子设计竞赛', 'A类', '计算机', ARRAY['A类'], '剩余 3 天', 'open', '本科', '官网', '2024.04.10'),
('全国大学生数字技能应用大赛', 'B类', '计算机', ARRAY['B类'], '剩余 5 天', 'open', '不限', '官网', '2024.04.12');

INSERT INTO exams (title, date, level, category, requirement, "window", window_status) VALUES
('教师资格证考试', '11.02', '国家级', '教育类', '本科及以上', '即将截止 (10.15前)', 'ending'),
('计算机二级考试', '11.15', '国家级', 'IT/计算机', '不限', '已结束', 'closed'),
('英语四六级 (CET)', '11.23', '国家级', '语言类', '在校大学生', '已结束', 'closed');

INSERT INTO notifications (title, time, is_read) VALUES
('蓝桥杯报名通道即将开启', '10分钟前', FALSE),
('计算机等级考试成绩公布', '昨天', TRUE);
