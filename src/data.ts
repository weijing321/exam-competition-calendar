import { Competition, Exam, Notification } from './types';

export const COMPETITIONS: Competition[] = [
  {
    id: '1',
    title: '中国国际大学生创新大赛',
    level: '国家级 A类',
    category: '创新创业',
    tags: ['国家级 A类'],
    status: '报名中',
    registrationStatus: 'open',
    degree: '本科可报',
    channel: '官网',
    deadline: '2024.03.20'
  },
  {
    id: '2',
    title: '蓝桥杯全国软件和信息技术大赛',
    level: '国家级 A类',
    category: '计算机',
    tags: ['国家级 A类'],
    status: '即将截止',
    registrationStatus: 'open',
    degree: '专科可报',
    channel: '官网',
    deadline: '2023.12.01'
  },
  {
    id: '3',
    title: '初级外贸业务员考试',
    level: '职业资格',
    category: '外贸',
    tags: ['职业技能'],
    status: '未开始',
    registrationStatus: 'upcoming',
    degree: '不限',
    channel: '官网',
    deadline: '2024.05.10'
  },
  {
    id: '4',
    title: '全国大学生英语竞赛(NECCS)',
    level: '国家级 (B类)',
    category: '语言',
    tags: ['国家级 B类'],
    status: '已结束',
    registrationStatus: 'closed',
    degree: '不限学历',
    channel: '官网',
    deadline: '已结束'
  },
  {
    id: '5',
    title: '网页设计师职业技能证书',
    level: '职业等级',
    category: '计算机',
    tags: ['职业技能'],
    status: '报名中',
    registrationStatus: 'open',
    degree: '不限',
    channel: '公众号',
    deadline: '2024.04.15'
  },
  {
    id: '6',
    title: '国际商务单证员考试',
    level: '职业资格',
    category: '外贸',
    tags: ['职业技能'],
    status: '已结束',
    registrationStatus: 'closed',
    degree: '本科',
    channel: '官网',
    deadline: '2023.10.20'
  },
  {
    id: '7',
    title: '华为认证ICT专家',
    level: '企业认证',
    category: '计算机',
    tags: ['职业技能'],
    status: '常年预约',
    registrationStatus: 'open',
    degree: '不限',
    channel: '官网',
    deadline: '不限时间'
  }
];

export const DEADLINE_COMPETITIONS: Competition[] = [
  {
    id: 'd1',
    title: '全国大学生电子设计竞赛',
    level: 'A类',
    category: '',
    tags: ['A类'],
    status: '剩余 3 天',
    registrationStatus: 'open',
    daysRemaining: 3
  },
  {
    id: 'd2',
    title: '全国大学生数字技能应用大赛',
    level: 'B类',
    category: '',
    tags: ['B类'],
    status: '剩余 5 天',
    registrationStatus: 'open',
    daysRemaining: 5
  }
];

export const WECHAT_COMPETITIONS = [
  { id: 'w1', title: '公众号征文比赛', level: '校级 C类' },
  { id: 'w2', title: '海报设计作品征集', level: '院级 C类' }
];

export const EXAMS: Exam[] = [
  {
    id: 'e1',
    title: '教师资格证考试',
    date: '11.02',
    level: '国家级',
    category: '教育类',
    requirement: '本科及以上',
    window: '即将截止 (10.15前)',
    windowStatus: 'ending'
  },
  {
    id: 'e2',
    title: '计算机二级考试',
    date: '11.15',
    level: '国家级',
    category: 'IT/计算机',
    requirement: '不限',
    window: '已结束',
    windowStatus: 'closed'
  },
  {
    id: 'e3',
    title: '英语四六级 (CET)',
    date: '11.23',
    level: '国家级',
    category: '语言类',
    requirement: '在校大学生',
    window: '已结束',
    windowStatus: 'closed'
  }
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: '蓝桥杯报名通道即将开启', time: '10分钟前', isRead: false },
  { id: 'n2', title: '计算机等级考试成绩公布', time: '昨天', isRead: true }
];
