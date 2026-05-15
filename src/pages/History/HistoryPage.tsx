import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '../../components/Common';

interface HistoryPageProps {
  trades: any[];
  liveData: any;
  walletLogs: any[];
}

const HistoryPage: React.FC<HistoryPageProps> = ({ trades, liveData, walletLogs }) => {
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED' | 'PROFIT' | 'LOSS'>('ACTIVE');

  // Filter Logic
  const filteredTrades = trades.filter(item => {
    const isOpen = item.status === 'OPEN';
    const currentPrice = liveData[item.symbol]?.price || item.entry_price;
    const exitPrice = item.exit_price || currentPrice;
    const qty = item.quantity || 1;
    const pnl = (exitPrice - item.entry_price) * (item.type === 'BUY' ? 1 : -1) * qty;

    if (tradeFilter === 'ACTIVE') return isOpen;
    if (tradeFilter === 'CLOSED') return !isOpen;
    if (tradeFilter === 'PROFIT') return !isOpen && pnl > 0;
    if (tradeFilter === 'LOSS') return !isOpen && pnl < 0;
    return true; // ALL
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-16"
    >
      {/* TRADES LOG */}
      <div className="space-y-6">
        <div className="px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Trade Execution Log</h3>
            <p className="text-slate-500 font-bold text-sm">COMPLETED AND ACTIVE SESSIONS</p>
          </div>
          
          <div className="flex gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl w-max">
            {['ALL', 'ACTIVE', 'CLOSED', 'PROFIT', 'LOSS'].map(f => (
              <button
                key={f}
                onClick={() => setTradeFilter(f as any)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  tradeFilter === f 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <DataTable headers={['Timestamp', 'Symbol', 'Type', 'Qty', 'Hold Time', 'Status', 'P&L', 'Price']}>
          {filteredTrades.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-20 text-slate-400 uppercase text-[10px] font-black tracking-widest">No trade history found</td>
            </tr>
          ) : filteredTrades.map((item, i) => {
            const isOpen = item.status === 'OPEN';
            const currentPrice = liveData[item.symbol]?.price || item.entry_price;
            const exitPrice = item.exit_price || currentPrice;
            const qty = item.quantity || 1;
            const pnl = (exitPrice - item.entry_price) * (item.type === 'BUY' ? 1 : -1) * qty;

            return (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-6 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-tighter whitespace-nowrap">
                  {new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-6 font-black text-slate-900 dark:text-white text-lg tracking-tighter whitespace-nowrap">{item.symbol}</td>
                <td className="px-6 py-6">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${item.type === 'BUY' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800'}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-6 font-black text-slate-700 dark:text-slate-300">{qty}</td>
                <td className="px-6 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.expected_duration || 'Intraday'}</td>
                <td className="px-6 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isOpen ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {isOpen ? 'ACTIVE' : 'SETTLED'}
                  </span>
                </td>
                <td className={`px-6 py-6 font-black text-base ${pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                  {isOpen && <span className="text-[8px] ml-1 opacity-50 uppercase">Live</span>}
                </td>
                <td className="px-6 py-6 text-right font-black text-xl text-slate-900 dark:text-white">
                  ₹{item.exit_price || item.entry_price}
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      {/* WALLET LOGS */}
      <div className="space-y-6">
        <div className="px-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Wallet History</h3>
          <p className="text-slate-500 font-bold text-sm">PAPER FUNDS TRANSACTIONS</p>
        </div>
        <DataTable headers={['Timestamp', 'Description', 'Type', 'Amount', 'Balance After']}>
          {walletLogs.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-20 text-slate-400 uppercase text-[10px] font-black tracking-widest">No wallet activity found</td>
            </tr>
          ) : walletLogs.map((log, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-6 text-slate-400 font-bold text-xs">
                {new Date(log.created_at).toLocaleString()}
              </td>
              <td className="px-6 py-6 font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">
                {log.reason?.replace('_', ' ')}
              </td>
              <td className="px-6 py-6">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black ${log.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {log.type}
                </span>
              </td>
              <td className={`px-6 py-6 font-black ${log.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {log.type === 'CREDIT' ? '+' : '-'}₹{Number(log.amount).toLocaleString()}
              </td>
              <td className="px-6 py-6 font-black text-slate-900 dark:text-white">
                ₹{Number(log.balance_after).toLocaleString()}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </motion.div>
  );
};

export default HistoryPage;
