import { Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  fetchNotifications, 
  fetchFavoriteCount, 
  fetchReminderCount,
  markNotificationRead 
} from '../services/api';
import type { Notification } from '../types';

export default function ProfileTab({ 
  onAction, 
  activeDegree, 
  onDegreeChange,
  pushEnabled,
  onPushToggle,
}: { 
  onAction: (msg: string) => void;
  activeDegree: 'undergrad' | 'junior';
  onDegreeChange: (deg: 'undergrad' | 'junior') => void;
  pushEnabled: boolean;
  onPushToggle: () => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [reminderCount, setReminderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [notifData, favCount, remCount] = await Promise.all([
          fetchNotifications(),
          fetchFavoriteCount(),
          fetchReminderCount(),
        ]);
        setNotifications(notifData.notifications);
        setFavoriteCount(favCount);
        setReminderCount(remCount);
      } catch (err) {
        console.warn('加载个人中心数据失败:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleNotificationClick = async (notif: Notification) => {
    onAction(`正在打开消息: ${notif.title}`);
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n => 
          n.id === notif.id ? { ...n, isRead: true } : n
        ));
      } catch (err) {
        console.warn('标记已读失败:', err);
      }
    }
  };

  return (
    <div className="space-y-12 pb-8">
      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b border-outline-variant sticky top-0 bg-background z-10 md:border-none md:static">
        <h1 className="text-xl font-bold md:text-2xl">考赛日历</h1>
        <button 
          onClick={() => onAction('正在跳转应用设置...')}
          className="p-2 rounded-full hover:bg-surface-container transition-colors"
        >
          <Settings className="w-5 h-5 text-primary" />
        </button>
      </header>

      {/* Greeting */}
      <section>
        <h2 className="text-4xl font-bold mb-2 tracking-tight">宝宝。</h2>
        <p className="text-base text-on-surface-variant">准备好规划你的学术旅程了吗？</p>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookmarks */}
        <div 
          onClick={() => onAction('正在跳转我的收藏列表...')}
          className="bg-surface-container-lowest p-6 rounded-xl academic-border hover:bg-surface-container transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">我的收藏</h3>
            <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded">
              {loading ? '...' : `${favoriteCount} 项`}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mb-6">你标记的重点竞赛和证书。</p>
          <div className="flex justify-end">
            <span className="text-xs font-bold text-primary group-hover:underline">查看全部</span>
          </div>
        </div>

        {/* Reminders */}
        <div 
          onClick={() => onAction('正在跳转提醒管理中心...')}
          className="bg-surface-container-lowest p-6 rounded-xl academic-border hover:bg-surface-container transition-colors cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold">我的提醒</h3>
            {reminderCount > 0 && (
              <span className="text-[10px] font-bold text-on-error-container bg-error-container px-2 py-1 rounded">
                {loading ? '...' : `${reminderCount} 个即将截止`}
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant mb-6">报名和考试的倒计时日历。</p>
          <div className="flex justify-end">
            <span className="text-xs font-bold text-primary group-hover:underline">管理提醒</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface-container-lowest p-6 rounded-xl academic-border md:col-span-2 group">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-bold">消息通知</h3>
            {notifications.some(n => !n.isRead) && (
              <div className="w-2.5 h-2.5 bg-error rounded-full"></div>
            )}
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-xs text-on-surface-variant text-center py-4">加载中...</p>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-4">暂无通知</p>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex justify-between items-center pb-3 cursor-pointer hover:translate-x-1 transition-transform ${
                    notif.id === notifications[notifications.length - 1].id ? '' : 'border-b border-outline-variant'
                  } ${notif.isRead ? 'opacity-60' : ''}`}
                >
                  <div>
                    <p className={`text-sm ${notif.isRead ? 'font-normal' : 'font-bold'}`}>{notif.title}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">{notif.time}</p>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant px-3 py-1">
                    {notif.isRead ? '已读' : '未读'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-surface-container-lowest p-6 rounded-xl academic-border md:col-span-2">
          <h3 className="text-lg font-bold mb-6">应用设置</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold">学历偏好设置</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">定制适合你的竞赛级别推荐</p>
              </div>
              <div className="flex bg-surface-container p-1 rounded-lg">
                <button 
                  onClick={() => {
                    onAction('已切换至：本科');
                    onDegreeChange('undergrad');
                  }}
                  className={`px-5 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeDegree === 'undergrad' 
                    ? 'text-white bg-inverse-surface' 
                    : 'text-on-surface-variant hover:text-on-background'
                  }`}
                >
                  本科
                </button>
                <button 
                  onClick={() => {
                    onAction('已切换至：专科');
                    onDegreeChange('junior');
                  }}
                  className={`px-5 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeDegree === 'junior' 
                    ? 'text-white bg-inverse-surface' 
                    : 'text-on-surface-variant hover:text-on-background'
                  }`}
                >
                  专科
                </button>
              </div>
            </div>
            
            <div className="h-px bg-outline-variant" />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold">推送开关</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">接收重要截止日期提醒</p>
              </div>
              <div 
                onClick={() => {
                  onAction('推送状态已切换');
                  onPushToggle();
                }}
                className="text-xs font-bold text-primary cursor-pointer hover:underline"
              >
                {pushEnabled ? '已开启' : '已关闭'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
