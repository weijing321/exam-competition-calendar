import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchCompetitions, fetchDeadlineCompetitions, searchCompetitions } from '../services/api';
import type { Competition } from '../types';

export default function HomeTab({ onAction }: { onAction: (msg: string) => void }) {
  const [aLevelCompetitions, setALevelCompetitions] = useState<Competition[]>([]);
  const [deadlineCompetitions, setDeadlineCompetitions] = useState<Competition[]>([]);
  const [wechatCompetitions, setWechatCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [beijingTimeShort, setBeijingTimeShort] = useState('');

  // 实时北京时间（短格式）
  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const bj = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
      const month = String(bj.getMonth() + 1).padStart(2, '0');
      const day = String(bj.getDate()).padStart(2, '0');
      const hours = String(bj.getHours()).padStart(2, '0');
      const minutes = String(bj.getMinutes()).padStart(2, '0');
      setBeijingTimeShort(`${month}-${day} ${hours}:${minutes}`);
    }
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // 用北京时间计算截止日期的剩余天数
  function calcDaysRemaining(deadline: string | undefined): number | null {
    if (!deadline || deadline === '不限时间' || deadline === '已结束') return null;
    const bjNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    bjNow.setHours(0, 0, 0, 0);
    // deadline 格式如 "2024.03.20" 或 "5月-6月"
    const match = deadline.match(/(\d{4})[./年](\d{1,2})[./月](\d{1,2})/);
    if (!match) return null;
    const deadlineDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    const diffMs = deadlineDate.getTime() - bjNow.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : null;
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [allComps, deadlineComps] = await Promise.all([
          fetchCompetitions(),
          fetchDeadlineCompetitions(7),
        ]);
        // A类重点赛事：筛选国家级 A类 标签
        const aLevel = allComps.filter(c => c.tags.includes('国家级 A类') || c.level.includes('A类'));
        setALevelCompetitions(aLevel.slice(0, 2));
        setDeadlineCompetitions(deadlineComps);
        // C级公众号赛事
        const wechat = allComps.filter(c => c.level.includes('C级') || c.level.includes('公众号'));
        setWechatCompetitions(wechat.slice(0, 20));
      } catch (err) {
        console.warn('加载首页数据失败:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      onAction('请输入搜索关键词');
      return;
    }
    onAction(`正在搜索"${searchKeyword}"相关赛事...`);
    try {
      await searchCompetitions(searchKeyword);
    } catch (err) {
      console.warn('搜索失败:', err);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Search Header for Mobile */}
      <div className="md:hidden flex justify-between items-center py-4 border-b border-outline-variant sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">考赛日历</h1>
        </div>
      </div>

      {/* Search & Quick Action */}
      <section className="space-y-4 pt-4 md:pt-0">
        {/* 实时北京时间 */}
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-on-surface-variant">北京时间</span>
          <span className="font-mono font-bold text-on-background">{beijingTimeShort || '--:--'}</span>
        </div>
        <div className="flex items-center bg-surface-container-lowest academic-border rounded-lg p-1">
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 py-2 outline-none placeholder:text-on-surface-variant"
            placeholder="搜索赛事或证书名称..."
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            className="text-xs font-bold px-4 py-2 hover:bg-surface-container transition-colors rounded"
          >
            搜索
          </button>
        </div>
        <button 
          onClick={() => onAction('正在加载日历排期...')}
          className="w-full flex items-center justify-between bg-inverse-surface text-inverse-on-surface px-5 py-4 rounded-lg hover:opacity-90 transition-opacity"
        >
          <span className="text-lg font-semibold">日历视图</span>
          <span className="text-sm opacity-80">查看全部排期</span>
        </button>
      </section>

      {/* A-level Competitions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">A类重点赛事</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest academic-border rounded-lg p-5 min-h-[140px] flex items-center justify-center">
              <span className="text-xs text-on-surface-variant">加载中...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aLevelCompetitions.map((comp) => (
              <div 
                key={comp.id}
                onClick={() => onAction(`正在跳转至赛事详情页: ${comp.title}`)}
                className="bg-surface-container-lowest academic-border rounded-lg p-5 flex flex-col justify-between min-h-[140px] hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold leading-tight max-w-[70%]">{comp.title}</h3>
                    <span className="border border-outline-variant px-2 py-0.5 rounded text-[10px] font-medium text-on-surface-variant whitespace-nowrap">{comp.level}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">类别: {comp.category}</p>
                </div>
                <div className="pt-4 border-t border-outline-variant mt-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-primary">状态: {comp.status}</span>
                  <span className="text-[11px] underline decoration-outline-variant underline-offset-4">查看详情</span>
                </div>
              </div>
            ))}
            {aLevelCompetitions.length === 0 && (
              <p className="text-xs text-on-surface-variant col-span-2 text-center py-4">暂无数据</p>
            )}
          </div>
        )}
      </section>

      {/* Deadline Approaching */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-outline-variant pb-2">
          <h2 className="text-lg font-semibold">近七日截止报名</h2>
          <span className="text-[11px] text-on-surface-variant">
            {loading ? '...' : `共 ${deadlineCompetitions.length} 项`}
          </span>
        </div>
        {loading ? (
          <div className="bg-surface-container-lowest academic-border rounded-lg p-4 text-center">
            <span className="text-xs text-on-surface-variant">加载中...</span>
          </div>
        ) : deadlineCompetitions.length === 0 ? (
          <div className="bg-surface-container-lowest academic-border rounded-lg p-4 text-center">
            <span className="text-xs text-on-surface-variant">暂无即将截止的赛事</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {deadlineCompetitions.map((comp, idx) => (
              <li 
                key={comp.id}
                onClick={() => onAction('正在调起报名接口...')}
                className={`academic-border rounded-lg p-4 flex justify-between items-center hover:bg-blue-100 transition-colors cursor-pointer ${
                  idx === 0 ? 'bg-primary-container' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <div className="space-y-1">
                  <h4 className={`text-sm font-bold ${idx === 0 ? 'text-on-primary-container' : ''}`}>{comp.title}</h4>
                  <div className="flex gap-2 text-[11px] text-on-surface-variant">
                    <span>{comp.level}</span>
                    {comp.daysRemaining != null && (
                      <span>剩余 {comp.daysRemaining} 天</span>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded ${
                  idx === 0 
                    ? 'text-on-primary-container bg-surface-container-lowest border border-outline-variant' 
                    : 'border border-outline-variant'
                }`}>
                  去报名
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* WeChat Competitions */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-outline-variant pb-2">
          <h2 className="text-lg font-semibold text-on-surface-variant">微信公众号赛事</h2>
          <span className="text-[11px] text-on-surface-variant">
            {loading ? '...' : `共 ${wechatCompetitions.length} 项`}
          </span>
        </div>
        {loading ? (
          <div className="bg-surface-container-lowest academic-border rounded-lg p-4 text-center">
            <span className="text-xs text-on-surface-variant">加载中...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-[1px] bg-outline-variant border border-outline-variant rounded-lg overflow-hidden">
            {wechatCompetitions.map((comp) => (
              <div 
                key={comp.id}
                onClick={() => onAction(`正在查看: ${comp.title}`)}
                className="bg-surface-container-lowest p-4 flex justify-between items-center hover:bg-surface-container transition-colors cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-sm">{comp.title}</span>
                  <p className="text-[10px] text-on-surface-variant">截止: {comp.deadline || '不限'}</p>
                </div>
                <span className="text-[11px] text-on-surface-variant whitespace-nowrap">{comp.level}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
