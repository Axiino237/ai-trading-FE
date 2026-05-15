import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { RefreshCw, Search, Terminal as TerminalIcon, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { BACKEND_URL } from '../../config';

interface SystemLog {
  id: string;
  level: 'info' | 'success' | 'warn' | 'error';
  symbol: string | null;
  message: string;
  data: any;
  created_at: string;
}

const LogsPage: React.FC<{ authToken: string }> = ({ authToken }) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLogs();
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000);
    }
    return () => clearInterval(interval);
  }, [authToken, autoRefresh]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/logs?limit=100`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setLogs(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'ALL' || log.level.toUpperCase() === filter;
    const matchesSearch = !search ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      (log.symbol && log.symbol.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'success': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'error': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'warn': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle size={14} />;
      case 'error': return <AlertCircle size={14} />;
      case 'warn': return <AlertCircle size={14} />;
      default: return <Info size={14} />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-1">System Intelligence</h3>
          <p className="text-slate-500 font-bold text-sm">LIVE AUDIT LOGS & AI DECISION STREAM</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${autoRefresh ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}
          >
            <RefreshCw size={14} className={autoRefresh ? 'animate-spin' : ''} />
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </button>
          <button
            onClick={fetchLogs}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:text-blue-500 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search logs by symbol or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition-all font-bold text-sm"
          />
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1 border border-slate-200 dark:border-slate-700/50">
          {['ALL', 'SUCCESS', 'INFO', 'ERROR'].map((l) => (
            <button
              key={l}
              onClick={() => setFilter(l)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === l ? 'bg-white dark:bg-slate-700 text-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* LOG FEED */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>

        <div className="p-2 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Intelligence / Event</th>
                <th className="px-6 py-4 text-right">Data</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-blue-500" size={32} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessing Intelligence Stream...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <TerminalIcon className="mx-auto mb-4 text-slate-700 opacity-20" size={48} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No matching logs found</p>
                  </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="group">
                  <td className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 rounded-l-2xl border-y border-l border-slate-100 dark:border-slate-800/50">
                    <div className="text-[10px] font-bold text-slate-500">
                      {new Date(log.created_at).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="text-[8px] text-slate-600 mt-1 uppercase">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/50">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getLevelStyles(log.level)}`}>
                      {getLevelIcon(log.level)}
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/50">
                    <span className="font-black text-xs text-blue-500 uppercase">{log.symbol || 'SYSTEM'}</span>
                  </td>
                  <td className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/50">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed max-w-md">
                      {log.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 rounded-r-2xl border-y border-r border-slate-100 dark:border-slate-800/50 text-right">
                    {log.data ? (
                      <button
                        onClick={() => console.log(log.data)}
                        className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline"
                      >
                        Inspect
                      </button>
                    ) : (
                      <span className="text-[9px] text-slate-600 uppercase">Empty</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default LogsPage;
