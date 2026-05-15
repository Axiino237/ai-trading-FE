import React from 'react';
import { LogOut, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SidebarItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  isOpen: boolean;
}> = ({ active, onClick, icon, label, isOpen }) => (
  <button
    onClick={onClick}
    className={`relative group flex items-center gap-4 w-full p-3.5 rounded-2xl transition-all duration-300 ${
      active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/20'
        : 'text-slate-400 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800/80'
    }`}
  >
    <div className="shrink-0">{icon}</div>
    <AnimatePresence>
      {isOpen && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="font-black text-xs tracking-[0.1em] uppercase whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>

    {active && isOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}

    {/* Tooltip for collapsed mode */}
    {!isOpen && (
      <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] border border-slate-800 translate-x-2 group-hover:translate-x-0">
        {label}
      </div>
    )}
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
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, authUser, handleLogout, navItems, isOpen, setIsOpen
}) => {
  const isAdmin = authUser?.role === 'ADMIN';

  return (
    <>
      {/* MOBILE OVERLAY (when sidebar open) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          width: isOpen ? 280 : (window.innerWidth < 768 ? 0 : 88),
          x: (window.innerWidth < 768 && !isOpen) ? -280 : 0
        }}
        className={`fixed md:relative h-full bg-[#0b1121] text-white p-5 border-r border-white/5 z-50 shadow-2xl transition-all duration-500 flex flex-col`}
      >
        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-12 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-600/30 hover:scale-110 transition-transform z-[60]"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

      {/* LOGO AREA */}
      <div className="mb-10 px-1 flex items-center gap-4 overflow-hidden">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20 shrink-0">
          <Activity size={24} className="text-white fill-white" />
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="text-xl font-black text-white tracking-tighter leading-none uppercase">Stocks<span className="text-blue-500">Pro</span></span>
              <span className={`text-[9px] font-black tracking-[0.2em] mt-1 ${isAdmin ? 'text-amber-400' : 'text-blue-400/70'}`}>
                {isAdmin ? 'TERMINAL ADMIN' : 'INSTITUTIONAL'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarItem
              key={item.id}
              isOpen={isOpen}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
              icon={<Icon size={20} />}
              label={item.label}
            />
          );
        })}
      </nav>

      {/* USER & FOOTER */}
      <div className="pt-6 border-t border-white/5 mt-auto space-y-4 overflow-hidden">
        <div 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-3 p-3 rounded-2xl bg-white/5 cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-white/5 ${!isOpen && 'justify-center'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg ${isAdmin ? 'bg-amber-500 shadow-amber-500/20' : 'bg-blue-600 shadow-blue-600/20'}`}>
            {authUser?.name?.charAt(0).toUpperCase()}
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-sm font-black text-white truncate uppercase tracking-tighter">{authUser?.name}</span>
                <span className={`text-[8px] font-black uppercase tracking-widest ${isAdmin ? 'text-amber-400' : 'text-slate-500'}`}>
                  {isAdmin ? 'System Master' : `${authUser?.plan_tier || 'STARTER'} TIER`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full p-4 rounded-2xl bg-rose-600/10 hover:bg-rose-600 transition-all text-rose-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] group ${!isOpen && 'justify-center'}`}
        >
          <LogOut size={18} className="shrink-0" />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
      </motion.aside>
    </>
  );
};
