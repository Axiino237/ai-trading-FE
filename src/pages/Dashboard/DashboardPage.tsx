import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap, Trash2, ChevronRight } from 'lucide-react';
import { DataTable } from '../../components/Common';

// ─── STATS DASHBOARD (Terminal Tab) ───────────────────────────────────────────
interface DashboardPageProps {
  stats: any;
  trades: any[];
  liveData: any;
  scanMode: string;
  setScanMode: (mode: string) => void;
  watchlist: any[];
  updateSettings: (updates: any) => void;
  handleTradeClose: (tradeId: number) => void;

  handleRemoveSymbol: (symbol: string) => void;
  setManualTradeSymbol: (symbol: string | null) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ stats, trades, liveData, scanMode, setScanMode, watchlist, updateSettings, handleTradeClose, handleRemoveSymbol, setManualTradeSymbol }) => {
  const [signalFilter, setSignalFilter] = useState<'ALL' | 'BULLISH'>('ALL');
  const activeTrades = trades.filter((t: any) => t.status === 'OPEN');
  
  // Real values
  const realBalance = stats.real || 0;
  const realInvested = stats.invested_real || 0;
  const realProfit = stats.mode === 'REAL' ? (stats.totalProfit || 0) : 0;
  
  // Paper values
  const paperBalance = stats.paper || 3000;
  const paperInvested = stats.investedCapital || 0;
  const paperProfit = stats.mode === 'PAPER' ? (stats.totalProfit || 0) : 0;
  const paperVirtualEquity = paperBalance + paperInvested + paperProfit;

  const isAutomationEngaged = scanMode === 'RELAXED' || scanMode === 'STRICT'; // Assuming any active scan mode means engaged

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* TOP ROW: CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* REAL PORTFOLIO */}
        <div className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full"></div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Real Portfolio</h3>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹{Number(realBalance).toLocaleString('en-IN')}</span>
                <span className="text-xs font-bold text-slate-500 mb-1">INR</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Angel One ID</p>
              <p className="text-xs font-bold text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-500/20 uppercase">
                {stats.angelOneId || 'S54321'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Invested Amount</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">₹{realInvested}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Available Cash</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">₹{realBalance}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
              ${realProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              <TrendingUp size={12} />
              {realProfit >= 0 ? '+' : ''}₹{realProfit.toFixed(2)} Total Profit
            </span>
          </div>
        </div>

        {/* VIRTUAL EQUITY */}
        <div className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Virtual Equity</h3>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹{Number(paperVirtualEquity).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              <span className="text-xs font-bold text-slate-500 mb-1">INR</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Invested Amount</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">₹{Number(paperInvested).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Available Cash</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">₹{Number(paperBalance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
              ${paperProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              <TrendingUp size={12} />
              {paperProfit >= 0 ? '+' : ''}₹{paperProfit.toFixed(2)} Total Profit
            </span>
          </div>
        </div>

        {/* AUTOMATION ENGINE */}
        <div className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Automation Engine</h3>
              <p className="text-xl font-black text-blue-500 uppercase tracking-widest">
                {isAutomationEngaged ? 'Engaged' : 'Standby'}
              </p>
            </div>
            <div 
              onClick={() => {
                const newMode = scanMode === 'STRICT' ? 'OFF' : 'STRICT';
                setScanMode(newMode);
                updateSettings({ scan_mode: newMode });
              }}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer flex transition-colors ${isAutomationEngaged ? 'bg-blue-600 justify-end shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-700 justify-start'}`}
            >
              <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md"></motion.div>
            </div>
          </div>
          
          <div className="mt-10 z-10">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
              System is scanning market depth for AI-driven trade execution.
            </p>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: TABLES */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        
        {/* ALPHA TRAPS SIGNALS */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.3em]">Alpha Traps Signals</h3>
            <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1 border border-slate-200 dark:border-slate-700/50">
              <button 
                onClick={() => setSignalFilter('ALL')}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-md shadow-sm ${signalFilter === 'ALL' ? 'text-slate-900 dark:text-white bg-blue-600/20 border border-blue-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}>All</button>
              <button 
                onClick={() => setSignalFilter('BULLISH')}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-md shadow-sm ${signalFilter === 'BULLISH' ? 'text-slate-900 dark:text-white bg-blue-600/20 border border-blue-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}>Bullish</button>
            </div>
          </div>
          <div className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-[300px]">
             <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                  <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Asset</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">LTP</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Technical Trend</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">System Status</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {(() => {
                  const filteredList = watchlist.filter(item => {
                      const current = liveData[item.symbol];
                      if (!current || !current.pass) return false;
                      
                      if (signalFilter === 'ALL') return true;
                      return current.side === 'BUY';
                  });

                  if (filteredList.length === 0) {
                    return (
                      <tr>
                        <td colSpan={4} className="text-center py-24 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                          No Active Signals Found
                        </td>
                      </tr>
                    );
                  }

                  return filteredList.map((item: any, i: number) => {
                     const current = liveData[item.symbol] || { price: 0, change: '0%', pass: false, side: 'NONE' };
                     const isPositive = parseFloat(current.change) > 0;
                     return (
                       <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                         <td className="px-5 py-4 font-black text-slate-900 dark:text-slate-200 text-xs">{item.symbol}</td>
                         <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-400 text-xs">₹{current.price || '—'}</td>
                       <td className={`px-5 py-4 font-black text-xs ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {current.change || '—'}
                       </td>
                       <td className="px-5 py-4">
                         {current.pass ? (
                           <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded ${current.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                             {current.side} Signal
                           </span>
                         ) : (
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Scanning</span>
                         )}
                       </td>
                       <td className="px-5 py-4 text-right flex justify-end items-center gap-3">
                         <button 
                           onClick={() => setManualTradeSymbol(item.symbol)}
                           className="p-1.5 bg-slate-800/50 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 border border-slate-700/50 hover:border-blue-500/30 rounded-lg transition-colors"
                         >
                           <Zap size={14} />
                         </button>
                         <button 
                           onClick={() => handleRemoveSymbol(item.symbol)}
                           className="p-1.5 bg-slate-800/50 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/30 rounded-lg transition-colors"
                         >
                           <Trash2 size={14} />
                         </button>
                       </td>
                     </tr>
                   );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* OPEN EXPOSURE */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.3em]">Open Exposure</h3>
            <span className="px-4 py-1.5 text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 rounded-full uppercase tracking-widest shadow-sm">
              {activeTrades.length} Active
            </span>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-[300px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Symbol</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Qty</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Entry</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Live</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">P&L</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Hold Time</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                  {activeTrades.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-24 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        No Active Positions
                      </td>
                    </tr>
                  ) : activeTrades.map((t: any, i: number) => {
                    const currentPrice = liveData[t.symbol]?.price || t.entry_price;
                    const pnl = (currentPrice - t.entry_price) * (t.type === 'BUY' ? 1 : -1) * (t.quantity || 1);
                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4 font-black text-slate-900 dark:text-slate-200 text-xs">{t.symbol}</td>
                        <td className="px-5 py-4 font-bold text-slate-400 text-xs">{t.quantity || 1}</td>
                        <td className="px-5 py-4 font-bold text-slate-400 text-xs">₹{t.entry_price}</td>
                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-200 text-xs">₹{currentPrice}</td>
                        <td className={`px-5 py-4 font-black text-xs ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          {t.expected_duration || 'Intraday'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => handleTradeClose(t.id)}
                            className="px-4 py-2 text-[9px] font-black text-slate-300 bg-slate-800 border border-slate-700 hover:bg-rose-600/20 hover:text-rose-400 hover:border-rose-500/30 rounded-lg transition-all uppercase tracking-widest shadow-sm">
                            Exit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

// ─── WATCHLIST PAGE (Watchlist Tab) ────────────────────────────────────────────
interface WatchlistPageProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  handleAddSymbol: (val: string) => void;
  suggestions: any[];
  watchlist: any[];
  liveData: any;

  handleRemoveSymbol: (symbol: string) => void;
  setManualTradeSymbol: (symbol: string | null) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  searchQuery, setSearchQuery, handleAddSymbol,
  suggestions, watchlist, liveData, handleRemoveSymbol, setManualTradeSymbol
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="mb-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Market Monitor</h3>
        <p className="text-slate-500 font-bold text-sm">TRACK AND TRADE YOUR FAVOURITE SYMBOLS IN REAL-TIME</p>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Enter Scrip Name (e.g. RELIANCE, TCS)..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-6 pr-6 outline-none focus:border-blue-600 transition-all font-bold text-slate-700 dark:text-slate-200 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol(searchQuery)}
            />
          </div>
          <button
            onClick={() => handleAddSymbol(searchQuery)}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 whitespace-nowrap"
          >
            Monitor Symbol
          </button>
        </div>

        {/* SUGGESTIONS DROPDOWN */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-20"
            >
              {suggestions.slice(0, 6).map((item: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleAddSymbol(item.tradingSymbol)}
                  className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-black text-xs">EQ</div>
                    <span className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">{item.tradingSymbol}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WATCHLIST TABLE */}
      <DataTable headers={['Instrument', 'Live Price', 'Change', 'Signal', 'Actions']}>
        {watchlist.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center py-20 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              Watchlist empty — search and add symbols above
            </td>
          </tr>
        ) : watchlist.map((item: any, i: number) => {
          const current = liveData[item.symbol] || { price: 0, change: '0%', pass: false, side: 'NONE' };
          const isPositive = parseFloat(current.change) > 0;
          const isNegative = parseFloat(current.change) < 0;

          return (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <td className="px-6 py-5 font-black text-slate-900 dark:text-white text-lg uppercase tracking-tighter">
                {item.symbol}
              </td>
              <td className="px-6 py-5 font-bold text-slate-700 dark:text-slate-300 text-lg">
                {current.price ? `₹${current.price}` : '—'}
              </td>
              <td className={`px-6 py-5 font-black ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-400'}`}>
                <div className="flex items-center gap-2">
                  {isPositive ? <TrendingUp size={16} /> : isNegative ? <TrendingDown size={16} /> : <Activity size={16} />}
                  {current.change || '—'}
                </div>
              </td>
              <td className="px-6 py-5">
                {current.pass ? (
                  <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest animate-pulse ${current.side === 'SELL' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {current.side === 'SELL' ? '🔻 SELL' : '✅ BUY'}
                  </span>
                ) : (
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Scanning...</span>
                )}
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setManualTradeSymbol(item.symbol)}
                    title="Manual Trade"
                    className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-lg"
                  >
                    <Zap size={16} fill="currentColor" />
                  </button>
                  <button
                    onClick={() => handleRemoveSymbol(item.symbol)}
                    title="Remove"
                    className="text-slate-400 hover:text-rose-600 p-2.5 rounded-xl hover:bg-rose-50 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </motion.div>
  );
};

export default DashboardPage;
