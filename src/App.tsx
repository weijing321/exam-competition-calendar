/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import HomeTab from './components/HomeTab';
import LibraryTab from './components/LibraryTab';
import CalendarTab from './components/CalendarTab';
import ProfileTab from './components/ProfileTab';
import { fetchUserSettings, updateDegree, togglePush } from './services/api';

type Tab = 'home' | 'library' | 'calendar' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [degree, setDegree] = useState<'undergrad' | 'junior'>('undergrad');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [libraryFilter, setLibraryFilter] = useState('全部');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [beijingTime, setBeijingTime] = useState('');

  // 实时北京时间
  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const bj = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
      const year = bj.getFullYear();
      const month = String(bj.getMonth() + 1).padStart(2, '0');
      const day = String(bj.getDate()).padStart(2, '0');
      const hours = String(bj.getHours()).padStart(2, '0');
      const minutes = String(bj.getMinutes()).padStart(2, '0');
      const seconds = String(bj.getSeconds()).padStart(2, '0');
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weekDay = weekDays[bj.getDay()];
      setBeijingTime(`${year}年${month}月${day}日 ${weekDay} ${hours}:${minutes}:${seconds}`);
    }
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 从后端加载用户设置
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchUserSettings();
        setDegree(settings.degree as 'undergrad' | 'junior');
        setPushEnabled(settings.push_enabled);
      } catch (err) {
        console.warn('加载用户设置失败，使用默认值:', err);
      }
      setDataLoaded(true);
    }
    loadSettings();
  }, []);

  const triggerAction = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2000);
  };

  const handleDegreeChange = async (newDegree: 'undergrad' | 'junior') => {
    setDegree(newDegree);
    try {
      await updateDegree(newDegree);
    } catch (err) {
      console.warn('同步学历偏好失败:', err);
    }
  };

  const handlePushToggle = async () => {
    const newState = !pushEnabled;
    setPushEnabled(newState);
    try {
      await togglePush(newState);
    } catch (err) {
      console.warn('同步推送设置失败:', err);
    }
  };

  const navItems = [
    { id: 'home', label: '首页' },
    { id: 'library', label: '比赛库' },
    { id: 'calendar', label: '考证日历' },
    { id: 'profile', label: '个人中心' },
  ] as const;

  return (
    <div className="flex min-h-screen bg-background relative overflow-x-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-full text-xs font-bold shadow-xl flex items-center whitespace-nowrap"
          >
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-full border-r border-outline-variant bg-surface py-8 px-6">
        <h1 className="text-2xl font-bold mb-4 px-2">考赛日历</h1>
        {/* 实时北京时间 */}
        <div className="mb-8 px-2 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant">
          <div className="text-[10px] text-on-surface-variant mb-0.5">北京时间</div>
          <div className="text-xs font-mono font-bold text-on-background tracking-tight">{beijingTime || '加载中...'}</div>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-surface-container text-on-background font-bold border-l-4 border-on-background'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 px-5 md:px-12 pt-0 md:pt-8 max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && <HomeTab onAction={triggerAction} />}
            {activeTab === 'library' && (
              <LibraryTab 
                onAction={triggerAction} 
                activeFilter={libraryFilter} 
                onFilterChange={setLibraryFilter} 
              />
            )}
            {activeTab === 'calendar' && <CalendarTab onAction={triggerAction} />}
            {activeTab === 'profile' && (
              <ProfileTab 
                onAction={triggerAction} 
                activeDegree={degree} 
                onDegreeChange={handleDegreeChange}
                pushEnabled={pushEnabled}
                onPushToggle={handlePushToggle}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Bottom Spacer for Mobile Nav */}
        <div className="h-24 md:hidden" />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background border-t border-outline-variant px-2 py-2 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-2 flex-1 transition-all ${
              activeTab === item.id
                ? 'text-on-background'
                : 'text-on-surface-variant'
            }`}
          >
            <span className={`text-[11px] font-bold pb-1 ${
              activeTab === item.id ? 'border-b-2 border-on-background scale-100' : 'scale-95'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
