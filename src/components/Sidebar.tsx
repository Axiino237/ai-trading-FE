import React from 'react';
import { Zap, User } from 'lucide-react';

export const SidebarItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`nav-link flex items-center gap-3 w-full p-4 rounded-2xl transition-all ${
      active
        ? 'bg-white/10 dark:bg-slate-800 text-white shadow-xl'
        : 'text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-200 hover:bg-white/5 dark:hover:bg-slate-800/50'
    }`}
  >
    {icon}
    <span className="font-bold text-sm tracking-tight">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
  </button>
);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  authUser: any;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  handleLogout: () => void;
  navItems: { id: string; label: string; icon: any }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, authUser, handleLogout, navItems
}) => {
  const isAdmin = authUser?.role === 'ADMIN';

  return (
    <aside className="app-sidebar hidden md:flex flex-col h-full w-72 bg-slate-900 text-white p-6 border-r border-white/10">
      {/* LOGO */}
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
          <Zap size={22} className="text-white fill-white" />
        </div>
        <div className="flex flex-col user-info">
          <span className="text-xl font-black text-white tracking-tighter leading-none uppercase">Stocks Pro</span>
          <span className={`text-[10px] font-bold tracking-widest mt-1 ${isAdmin ? 'text-amber-400' : 'text-blue-400'}`}>
            {isAdmin ? '👑 ADMIN' : 'ENTERPRISE'}
          </span>
        </div>
      </div>

      {/* NAV — dynamically rendered from filtered navItems */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarItem
              key={item.id}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              icon={<Icon size={20} />}
              label={item.label}
            />
          );
        })}
      </nav>

      {/* USER CARD */}
      <div className="pt-6 border-t border-white/5 mt-auto space-y-3">
        <div 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm ${isAdmin ? 'bg-amber-500' : 'bg-blue-600'}`}>
            {authUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden user-info">
            <span className="text-sm font-bold text-white truncate">{authUser?.name}</span>
            <span className={`text-[9px] font-bold uppercase tracking-widest ${isAdmin ? 'text-amber-400' : 'text-slate-500'}`}>
              {isAdmin ? 'Administrator' : `${authUser?.plan_tier || 'STARTER'} Plan`}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-rose-600/20 hover:text-rose-400 transition-all text-slate-400 font-bold text-xs uppercase tracking-widest"
        >
          <User size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};
