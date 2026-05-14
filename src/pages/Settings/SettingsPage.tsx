import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Zap, Lock } from 'lucide-react';


interface SettingsPageProps {
  tradeMode: string;
  setTradeMode: (mode: string) => void;
  scanMode: string;
  setScanMode: (mode: string) => void;
  maxTrades: number;
  setMaxTrades: (val: number) => void;
  updateSettings: (updates: any) => void;
  authUser: any;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  tradeMode,
  setTradeMode,
  scanMode,
  setScanMode,
  maxTrades,
  setMaxTrades,
  updateSettings,
  authUser
}) => {
  const isAdmin = authUser?.role === 'ADMIN';
  const isPro = authUser?.plan_tier === 'PRO';
  const hasFullAccess = isAdmin || isPro;

  // If user is downgraded, automatically enforce conservative settings
  useEffect(() => {
    if (!hasFullAccess) {
      if (tradeMode !== 'PAPER') setTradeMode('PAPER');
      if (scanMode !== 'STRICT') setScanMode('STRICT');
      if (maxTrades !== 5) setMaxTrades(5);
    }
  }, [hasFullAccess]);

  const handleOrderCapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasFullAccess) return;
    const val = parseInt(e.target.value) || 5;
    setMaxTrades(val);
    updateSettings({ max_trades_per_day: val });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Advanced Configuration</h3>
          <p className="text-slate-500 font-bold text-sm">MANAGE YOUR TRADING ENVIRONMENT AND RISK PARAMETERS</p>
        </div>
        {!hasFullAccess && (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 px-4 py-2 rounded-xl border border-amber-500/20">
            <Lock size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Settings Locked (Starter Plan)</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#0b1121] rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-200 dark:divide-slate-800/50">
        
        {/* Trading Environment */}
        <div className={`p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors group ${!hasFullAccess ? 'opacity-70' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
          <div className="flex items-center gap-6 md:gap-8">
            <div className="w-16 h-16 rounded-[24px] bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter">Trading Environment</p>
              <p className="text-xs md:text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">
                Isolate sessions or sync with real capital
              </p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1.5 border border-slate-300 dark:border-slate-700/50 relative">
            {!hasFullAccess && (
               <div className="absolute inset-0 z-10 cursor-not-allowed" title="Requires PRO Plan or Admin Access"></div>
            )}
            <button 
              onClick={() => { if(hasFullAccess) { setTradeMode('PAPER'); updateSettings({ trade_mode: 'PAPER' }); } }}
              className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                tradeMode === 'PAPER' ? 'bg-blue-600/20 text-slate-900 dark:text-white border border-blue-500/30 shadow-md' : 'text-slate-500 border border-transparent'
              }`}
            >
              Sandbox
            </button>
            <button 
              onClick={() => { if(hasFullAccess) { setTradeMode('REAL'); updateSettings({ trade_mode: 'REAL' }); } }}
              className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                tradeMode === 'REAL' ? 'bg-blue-600/20 text-slate-900 dark:text-white border border-blue-500/30 shadow-md' : 'text-slate-500 border border-transparent'
              }`}
            >
              Live
            </button>
          </div>
        </div>

        {/* Session Order Cap */}
        <div className={`p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors group ${!hasFullAccess ? 'opacity-70' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
          <div className="flex items-center gap-6 md:gap-8">
            <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Activity size={28} />
            </div>
            <div>
              <p className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter">Session Order Cap</p>
              <p className="text-xs md:text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">
                Maximum automated executions per cycle
              </p>
            </div>
          </div>
          <div className="relative">
            {!hasFullAccess && (
               <div className="absolute inset-0 z-10 cursor-not-allowed" title="Requires PRO Plan or Admin Access"></div>
            )}
            <input 
              type="number" 
              value={maxTrades}
              onChange={handleOrderCapChange}
              disabled={!hasFullAccess}
              className={`w-32 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/50 rounded-xl py-4 text-center font-black text-2xl text-slate-900 dark:text-white outline-none ${!hasFullAccess ? 'text-slate-500' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
              min="1"
              max="100"
            />
          </div>
        </div>

        {/* Scan Intelligence */}
        <div className={`p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors group ${!hasFullAccess ? 'opacity-70' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
          <div className="flex items-center gap-6 md:gap-8">
            <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Zap size={28} />
            </div>
            <div>
              <p className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter">Scan Intelligence</p>
              <p className="text-xs md:text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">
                Switch between high-conviction or volume signals
              </p>
            </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1.5 border border-slate-300 dark:border-slate-700/50 relative">
            {!hasFullAccess && (
               <div className="absolute inset-0 z-10 cursor-not-allowed" title="Requires PRO Plan or Admin Access"></div>
            )}
            <button 
              onClick={() => { if(hasFullAccess) { setScanMode('STRICT'); updateSettings({ scan_mode: 'STRICT' }); } }}
              className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                scanMode === 'STRICT' ? 'bg-blue-600/20 text-slate-900 dark:text-white border border-blue-500/30 shadow-md' : 'text-slate-500 border border-transparent'
              }`}
            >
              Conservative
            </button>
            <button 
              onClick={() => { if(hasFullAccess) { setScanMode('RELAXED'); updateSettings({ scan_mode: 'RELAXED' }); } }}
              className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                scanMode === 'RELAXED' ? 'bg-blue-600/20 text-slate-900 dark:text-white border border-blue-500/30 shadow-md' : 'text-slate-500 border border-transparent'
              }`}
            >
              Aggressive
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default SettingsPage;
