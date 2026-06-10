import { Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchCompetitions, addFavorite, addReminder, createCompetition } from '../services/api';
import type { Competition } from '../types';

export default function LibraryTab({ 
  onAction, 
  activeFilter, 
  onFilterChange 
}: { 
  onAction: (msg: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [beijingTime, setBeijingTime] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // 新增表单
  const [newTitle, setNewTitle] = useState('');
  const [newLevel, setNewLevel] = useState('A级');
  const [newCategory, setNewCategory] = useState('职业技能');
  const [newDegree, setNewDegree] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  // 实时北京时间
  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const bj = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
      const month = String(bj.getMonth() + 1).padStart(2, '0');
      const day = String(bj.getDate()).padStart(2, '0');
      const hours = String(bj.getHours()).padStart(2, '0');
      const minutes = String(bj.getMinutes()).padStart(2, '0');
      setBeijingTime(`${month}-${day} ${hours}:${minutes}`);
    }
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // 当筛选条件变化时重新加载
  useEffect(() => {
    loadData();
  }, [activeFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchCompetitions(activeFilter);
      setCompetitions(data);
    } catch (err) {
      console.warn('加载比赛库数据失败:', err);
    }
    setLoading(false);
  }

  const handleFilterClick = (filterId: string, label: string) => {
    onAction(`已筛选：${label}`);
    onFilterChange(filterId);
  };

  const handleFavorite = async (comp: Competition) => {
    onAction('已添加至收藏');
    try {
      await addFavorite(comp.id);
    } catch (err) {
      console.warn('收藏操作失败:', err);
    }
  };

  const handleReminder = async (comp: Competition) => {
    onAction('已设置提醒');
    try {
      await addReminder(comp.id);
    } catch (err) {
      console.warn('提醒设置失败:', err);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      onAction('请输入比赛名称');
      return;
    }
    try {
      await createCompetition({
        title: newTitle.trim(),
        level: newLevel,
        category: newCategory,
        degree: newDegree.trim() || undefined,
        deadline: newDeadline.trim() || undefined,
      });
      onAction(`已添加：${newTitle.trim()}`);
      setShowAddModal(false);
      setNewTitle('');
      setNewLevel('A级');
      setNewCategory('职业技能');
      setNewDegree('');
      setNewDeadline('');
      // 刷新列表
      await loadData();
    } catch (err) {
      console.warn('新增比赛失败:', err);
      onAction('新增失败，请重试');
    }
  };

  // 按级别分组：A级、B级、其他
  const levelGroups = [
    { id: 'A', label: 'A级', match: (l: string) => l.includes('A') },
    { id: 'B', label: 'B级', match: (l: string) => l.includes('B') },
    { id: 'C', label: '其他', match: (l: string) => !l.includes('A') && !l.includes('B') },
  ];

  const categories = ['职业技能', '计算机', '外贸', '创新创业', '语言', '其他'];
  const levels = ['A级', 'B级', 'C级(公众号)', '自定义'];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <header className="md:hidden flex justify-between items-center py-4 border-b border-outline-variant sticky top-0 bg-background z-10">
        <h1 className="text-xl font-bold">考赛日历</h1>
        <button 
          onClick={() => onAction('正在调起搜索...')}
          className="p-2 rounded-full hover:bg-surface-container transition-colors"
        >
          <Search className="w-5 h-5 text-primary" />
        </button>
      </header>

      <section className="pt-4 md:pt-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-4xl font-bold tracking-tight">比赛库</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-mono">{beijingTime || '--:--'} 北京时间</span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              新增比赛
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar border-b border-outline-variant mb-6">
          {[
            { id: '全部', label: '全部' },
            { id: '职业技能', label: '职业技能' },
            { id: '计算机', label: '计算机' },
            { id: '外贸', label: '外贸' },
            { id: '创新创业', label: '创新创业' },
            { id: '语言', label: '语言' },
          ].map((filter) => (
            <button 
              key={filter.id}
              onClick={() => handleFilterClick(filter.id, filter.label)}
              className={`text-sm font-bold pb-2 whitespace-nowrap border-b-2 transition-all ${
                activeFilter === filter.id 
                ? 'border-on-background text-on-background' 
                : 'border-transparent text-on-surface-variant hover:text-on-background'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Competition Level Groups */}
        {loading ? (
          <div className="text-center py-12">
            <span className="text-sm text-on-surface-variant">加载中...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {levelGroups.map((group) => {
              const compsInGroup = competitions.filter(c => group.match(c.level));
              return (
                <div key={group.id} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-outline-variant pb-2 px-1">
                    <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">{group.label}</h3>
                    <span className="text-[10px] font-bold text-outline-variant">{compsInGroup.length}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {compsInGroup.length === 0 ? (
                      <p className="text-xs text-outline-variant italic py-4 text-center col-span-full">暂无数据</p>
                    ) : (
                      compsInGroup.map((comp) => (
                        <article key={comp.id} className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col justify-between hover:border-primary transition-colors group rounded-lg">
                          <div>
                            <h3 className="text-sm font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                              {comp.title}
                            </h3>
                            <div className="space-y-0.5 mb-4">
                              <p className="text-[10px] text-on-surface-variant">
                                <span className="font-bold text-on-background">级别:</span> {comp.level}
                              </p>
                              <p className="text-[10px] text-on-surface-variant">
                                <span className="font-bold text-on-background">学历:</span> {comp.degree || '不限'}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-end border-t border-outline-variant pt-2 mt-auto">
                            <div>
                              <p className="text-[8px] text-on-surface-variant uppercase">截止日期</p>
                              <p className="text-sm font-bold tracking-tight text-on-background">
                                {comp.deadline || '--'}
                              </p>
                              {comp.daysRemaining != null && (
                                <p className="text-[10px] text-error font-medium mt-0.5">
                                  剩余 {comp.daysRemaining} 天
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleFavorite(comp); }}
                                className="text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
                              >
                                收藏
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleReminder(comp); }}
                                className="text-[10px] font-bold text-on-background hover:text-primary transition-colors underline underline-offset-4"
                              >
                                提醒
                              </button>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 新增比赛弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddModal(false)}>
          <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">新增比赛</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full hover:bg-surface-container transition-colors">
                <span className="block w-4 h-4 text-lg leading-none">×</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">比赛名称 *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="输入比赛名称"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">级别</label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest focus:outline-none focus:border-primary"
                >
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">专业分类</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest focus:outline-none focus:border-primary"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">学历要求</label>
                <input
                  type="text"
                  value={newDegree}
                  onChange={(e) => setNewDegree(e.target.value)}
                  placeholder="如：本科、专科、不限"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">截止日期</label>
                <input
                  type="text"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  placeholder="如：2026.06.30"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 text-sm font-bold border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
