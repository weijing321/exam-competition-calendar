import { Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchExams, addReminder, createExam } from '../services/api';
import type { Exam } from '../types';

export default function CalendarTab({ onAction }: { onAction: (msg: string) => void }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [loading, setLoading] = useState(true);
  const [beijingTime, setBeijingTime] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // 新增表单
  const [newTitle, setNewTitle] = useState('');
  const [newLevel, setNewLevel] = useState('国家级');
  const [newCategory, setNewCategory] = useState('教育类');
  const [newDate, setNewDate] = useState('');
  const [newRequirement, setNewRequirement] = useState('');

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

  useEffect(() => {
    loadData();
  }, [activeCategory]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchExams(activeCategory !== '全部' ? activeCategory : undefined);
      setExams(data);
    } catch (err) {
      console.warn('加载考试数据失败:', err);
    }
    setLoading(false);
  }

  const handleFilterClick = (category: string) => {
    setActiveCategory(category);
    onAction(`已筛选：${category}`);
  };

  const handleAddReminder = async (exam: Exam) => {
    onAction('已添加考试提醒');
    try {
      await addReminder(undefined, exam.id);
    } catch (err) {
      console.warn('添加提醒失败:', err);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      onAction('请输入考试名称');
      return;
    }
    try {
      await createExam({
        title: newTitle.trim(),
        level: newLevel,
        category: newCategory,
        date: newDate.trim() || undefined,
        requirement: newRequirement.trim() || undefined,
      });
      onAction(`已添加：${newTitle.trim()}`);
      setShowAddModal(false);
      setNewTitle('');
      setNewLevel('国家级');
      setNewCategory('教育类');
      setNewDate('');
      setNewRequirement('');
      await loadData();
    } catch (err) {
      console.warn('新增考试失败:', err);
      onAction('新增失败，请重试');
    }
  };

  // 按分类分组考试
  const categoryGroups = [
    { id: '教育类', label: '教育类', match: (c: string) => c === '教育类' },
    { id: 'IT/计算机', label: 'IT/计算机', match: (c: string) => c === 'IT/计算机' },
    { id: '语言类', label: '语言类', match: (c: string) => c === '语言类' },
    { id: '其他', label: '其他', match: (c: string) => c === '其他' || (!['教育类', 'IT/计算机', '语言类'].includes(c)) },
  ];

  const categories = ['教育类', 'IT/计算机', '语言类', '其他'];
  const levels = ['国家级', '省级', '校级', '自定义'];

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
          <h2 className="text-4xl font-bold tracking-tight">考证日历</h2>
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
              新增考证
            </button>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar border-b border-outline-variant mb-6">
          {[
            { id: '全部', label: '全部' },
            { id: '教育类', label: '教育类' },
            { id: 'IT/计算机', label: 'IT/计算机' },
            { id: '语言类', label: '语言类' },
          ].map((cat) => (
            <button 
              key={cat.id}
              onClick={() => handleFilterClick(cat.id)}
              className={`text-sm font-bold pb-2 whitespace-nowrap border-b-2 transition-all ${
                activeCategory === cat.id
                  ? 'border-on-background text-on-background' 
                  : 'border-transparent text-on-surface-variant hover:text-on-background'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Exam Category Groups */}
        {loading ? (
          <div className="text-center py-12">
            <span className="text-sm text-on-surface-variant">加载中...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {categoryGroups.map((group) => {
              const examsInGroup = exams.filter(e => group.match(e.category));
              // 当选中全部分类时显示所有分组，否则只显示匹配的分类
              if (activeCategory !== '全部' && activeCategory !== group.id && group.id !== '其他') return null;
              // 其他分组：只在全部分类或明确筛选其他时显示
              if (group.id === '其他' && activeCategory !== '全部' && activeCategory !== '其他') return null;
              if (examsInGroup.length === 0 && activeCategory !== '全部') return null;

              return (
                <div key={group.id} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-outline-variant pb-2 px-1">
                    <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">{group.label}</h3>
                    <span className="text-[10px] font-bold text-outline-variant">{examsInGroup.length}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {examsInGroup.length === 0 ? (
                      <p className="text-xs text-outline-variant italic py-4 text-center col-span-full">暂无数据</p>
                    ) : (
                      examsInGroup.map((exam) => (
                        <article key={exam.id} className="bg-surface-container-lowest border border-outline-variant p-4 flex flex-col justify-between hover:border-primary transition-colors group rounded-lg">
                          <div>
                            <h3 className="text-sm font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                              {exam.title}
                            </h3>
                            <div className="space-y-0.5 mb-4">
                              <p className="text-[10px] text-on-surface-variant">
                                <span className="font-bold text-on-background">级别:</span> {exam.level}
                              </p>
                              <p className="text-[10px] text-on-surface-variant">
                                <span className="font-bold text-on-background">学历:</span> {exam.requirement || '不限'}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-end border-t border-outline-variant pt-2 mt-auto">
                            <div>
                              <p className="text-[8px] text-on-surface-variant uppercase">考试日期</p>
                              <p className="text-sm font-bold tracking-tight text-on-background">
                                {exam.date || '--'}
                              </p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleAddReminder(exam); }}
                              className="text-[10px] font-bold text-on-background hover:text-primary transition-colors underline underline-offset-4"
                            >
                              提醒
                            </button>
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

      {/* 新增考证弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAddModal(false)}>
          <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">新增考证</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full hover:bg-surface-container transition-colors">
                <span className="block w-4 h-4 text-lg leading-none">×</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">考试名称 *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="输入考试名称"
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
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="如：本科、专科、不限"
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container-lowest focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">考试日期</label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="如：2026.06.15"
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
