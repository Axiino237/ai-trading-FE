import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  LayoutDashboard, 
  ListTree, 
  Settings as SettingsIcon, 
  Cpu, 
  TrendingUp, 
  TrendingDown,
  Wallet, 
  Zap, 
  Activity, 
  ShieldCheck,
  Search,
  Trash2,
  ChevronRight,
  User,
  History as HistoryIcon,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BACKEND_URL, SOCKET_URL } from './config';

// --- COMMON COMPONENTS ---

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${className}`}>
    {children}
  </div>
);

const DataTable: React.FC<{ 
  headers: string[], 
  children: React.ReactNode,
  className?: string 
}> = ({ headers, children, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm ${className}`}>
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
          {headers.map((header, i) => (
            <th key={i} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {children}
      </tbody>
    </table>
  </div>
);

const SearchBar: React.FC<{ 
  value: string, 
  onChange: (val: string) => void, 
  onAction: () => void,
  placeholder?: string,
  actionLabel?: string 
}> = ({ value, onChange, onAction, placeholder = "Search symbols...", actionLabel = "Add" }) => (
  <div className="flex gap-4 items-center w-full max-w-4xl">
    <div className="flex-1 relative">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      <input 
        type="text" 
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600 focus:ring-4 ring-blue-600/5 transition-all font-bold text-slate-700"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
      />
    </div>
    <button 
      onClick={onAction}
      className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 whitespace-nowrap"
    >
      {actionLabel}
    </button>
  </div>
);

const FilterBar: React.FC<{
  options: { label: string, value: string }[],
  activeValue: string,
  onSelect: (val: any) => void
}> = ({ options, activeValue, onSelect }) => (
  <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
    {options.map((opt) => (
      <button 
        key={opt.value}
        onClick={() => onSelect(opt.value)}
        className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all ${activeValue === opt.value ? 'bg-white text-blue-600 shadow-xl shadow-blue-600/10' : 'text-slate-400 hover:text-slate-600'}`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// --- TYPES ---

interface StockData {
  symbol: string;
  price: number;
  change: string;
  pass: boolean;
  side?: 'BUY' | 'SELL' | 'NONE';
  indicators?: {
    rsi: number;
    trend: string;
  };
}

interface Trade {
  symbol: string;
  entry_price: number;
  type: 'BUY' | 'SELL';
  status: string;
  exit_price?: number;
  created_at: string;
  trade_mode?: string;
  quantity?: number;
}

// --- COMPONENTS ---

const SidebarItem: React.FC<{ active: boolean, onClick: () => void, icon: any, label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`nav-link flex items-center gap-3 w-full p-4 rounded-2xl transition-all ${
      active ? 'bg-white/10 text-white shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

// --- MAIN APP ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'watchlist' | 'orders' | 'settings' | 'activity'>('dashboard');
  const [liveData, setLiveData] = useState<Record<string, StockData>>({});
  const [balances, setBalances] = useState({ real: 0, paper: 0 });
  const [automationOn, setAutomationOn] = useState(false);
  const [tradeMode, setTradeMode] = useState<'PAPER' | 'REAL'>('PAPER');
  const [scanMode, setScanMode] = useState<'STRICT' | 'RELAXED'>('STRICT');
  const [tradeLimit, setTradeLimit] = useState('5');
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [logOffset, setLogOffset] = useState(0);
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradeModal, setTradeModal] = useState<{ open: boolean, symbol: string, price: number, analysis: any }>({ open: false, symbol: '', price: 0, analysis: null });
  const [isTrading, setIsTrading] = useState(false);
  const [signalFilter, setSignalFilter] = useState<'all' | 'up'>('all');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'bot' | 'manual'>('all');

  // WebSocket Setup
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      forceNew: true
    });

    socket.on('connect', () => console.log('Connected to Backend ⚡'));
    
    socket.on('symbol-status', (data: StockData) => {
      setLiveData(prev => ({ 
        ...prev, 
        [data.symbol]: { ...(prev[data.symbol] || {}), ...data } 
      }));
    });

    socket.on('trade-executed', () => fetchData());

    return () => { socket.disconnect(); };
  }, []);

  // Fetch Initial Data
  const fetchData = async () => {
    try {
      const [histRes, balRes, setRes, wlRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/history`),
        axios.get(`${BACKEND_URL}/balances`),
        axios.get(`${BACKEND_URL}/settings`),
        axios.get(`${BACKEND_URL}/watchlist`)
      ]);
      
      setBalances(balRes.data);
      setAutomationOn(setRes.data.auto_trade_on);
      setTradeMode(setRes.data.trade_mode || 'PAPER');
      setScanMode(setRes.data.scan_mode || 'STRICT');
      setTradeLimit(setRes.data.daily_trade_limit?.toString() || '5');
      setWatchlist(wlRes.data);
      setHistory(histRes.data);
      
      const open = histRes.data.filter((t: any) => t.status === 'OPEN' || !t.exit_price);
      setActiveTrades(open);

      // Initial Logs
      try {
        const logRes = await axios.get(`${BACKEND_URL}/logs?limit=20&offset=0`);
        setLogs(logRes.data || []);
        if ((logRes.data || []).length < 20) setHasMoreLogs(false);
        setLogOffset(20);
      } catch (logErr) {
        setLogs([]);
        setHasMoreLogs(false);
      }
    } catch (e) {
      console.error('Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreLogs = async () => {
    if (!hasMoreLogs) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/logs?limit=20&offset=${logOffset}`);
      if (res.data.length < 20) setHasMoreLogs(false);
      setLogs(prev => [...prev, ...res.data]);
      setLogOffset(prev => prev + 20);
    } catch (e) {
      console.error('Load logs error');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 1) {
        try {
          const res = await axios.get(`${BACKEND_URL}/search?query=${searchQuery}`);
          setSuggestions(res.data.slice(0, 5));
        } catch (e) {
          console.log('Search error');
        }
      } else {
        setSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddSymbol = async (symbol: string) => {
    if (!symbol) return;
    try {
      await axios.post(`${BACKEND_URL}/watchlist`, { symbol: symbol.toUpperCase() });
      setWatchlist(prev => [{ symbol: symbol.toUpperCase() }, ...prev]);
      setSearchQuery('');
      setSuggestions([]);
    } catch (e) {
      alert('Failed to add symbol');
    }
  };

  const handleRemoveSymbol = async (symbol: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/watchlist/${symbol}`);
      setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
    } catch (e) {
      alert('Failed to remove');
    }
  };

  const updateSettings = async (updates: any) => {
    try {
      await axios.post(`${BACKEND_URL}/settings`, { ...updates });
      fetchData();
    } catch (e) {
      alert('Failed to update settings');
    }
  };

  const handleAnalyze = async (symbol: string) => {
    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/analyze`, { symbol });
      return res.data;
    } catch (e) {
      console.error('Analysis failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleManualTradeOpen = async (symbol: string, price: number) => {
    setTradeModal({ open: true, symbol, price, analysis: 'LOADING' });
    const analysis = await handleAnalyze(symbol);
    setTradeModal(prev => ({ ...prev, analysis }));
  };

  const handleManualTradeExecute = async (side: 'BUY' | 'SELL') => {
    try {
      setIsTrading(true);
      await axios.post(`${BACKEND_URL}/trade/manual`, {
        symbol: tradeModal.symbol,
        side,
        price: tradeModal.price,
        user_id: '00000000-0000-0000-0000-000000000000'
      });
      alert(`Successfully placed ${side} order for ${tradeModal.symbol}`);
      setTradeModal({ open: false, symbol: '', price: 0, analysis: null });
      fetchData();
    } catch (e) {
      alert('Trade execution failed');
    } finally {
      setIsTrading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-500 tracking-tight uppercase tracking-widest text-[10px]">Synchronizing Terminal...</p>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Terminal', icon: LayoutDashboard },
    { id: 'watchlist', label: 'Watchlist', icon: ListTree },
    { id: 'orders', label: 'History', icon: HistoryIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div id="root" className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar - Pro Desktop */}
      <aside className="app-sidebar">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Zap size={22} className="text-white fill-white" />
          </div>
          <div className="flex flex-col user-info">
            <span className="text-xl font-black text-white tracking-tighter leading-none uppercase">Stocks Pro</span>
            <span className="text-[10px] font-bold text-blue-400 tracking-widest mt-1">ENTERPRISE</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Terminal" />
          <SidebarItem active={activeTab === 'watchlist'} onClick={() => setActiveTab('watchlist')} icon={<ListTree size={20} />} label="Watchlist" />
          <SidebarItem active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<HistoryIcon size={20} />} label="History" />
          <SidebarItem active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={<Activity size={20} />} label="Activity" />
          <SidebarItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20} />} label="Settings" />
        </nav>

        <div className="pt-6 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">A</div>
            <div className="flex flex-col overflow-hidden user-info">
              <span className="text-sm font-bold text-white truncate">Axiino Trader</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Account</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Experience */}
      <div className="app-main flex flex-col flex-1 overflow-hidden">
        <header className="app-header px-10 border-b border-slate-200">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Global Market Terminal v4.0</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-600 uppercase">Connected</span>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></div>
            </button>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer">
              <User size={20} className="text-slate-600" />
            </div>
          </div>
        </header>

        <div className="content-body flex-1 overflow-y-auto p-10 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Card className="flex flex-col justify-between">
                      <div>
                        <span className="stat-label">Real Portfolio</span>
                        <div className="flex items-baseline gap-2">
                          <span className="stat-value">₹{Number(balances.real || 0).toLocaleString()}</span>
                          <span className="text-xs font-black text-slate-400">INR</span>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center gap-2 text-emerald-600 text-xs font-black bg-emerald-50 w-fit px-3 py-1.5 rounded-xl border border-emerald-100">
                        <TrendingUp size={14} />
                        <span>+0.00% Today</span>
                      </div>
                    </Card>
                    
                    <Card className="flex flex-col justify-between">
                      <div>
                        <span className="stat-label">Virtual Equity</span>
                        <div className="flex items-baseline gap-2">
                          <span className="stat-value">₹{Number(balances.paper || 0).toLocaleString()}</span>
                          <span className="text-xs font-black text-slate-400">INR</span>
                        </div>
                      </div>
                      <div className={`mt-6 flex items-center gap-2 text-xs font-black w-fit px-3 py-1.5 rounded-xl border ${balances.paper >= 100000 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
                        {balances.paper >= 100000 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{balances.paper >= 100000 ? '+' : ''}₹{(balances.paper - 100000).toFixed(2)} Total</span>
                      </div>
                    </Card>
                  </div>

                  <Card className="border-l-4 border-l-blue-600 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="stat-label">Automation Engine</span>
                        <h3 className={`text-xl font-black mt-1 ${automationOn ? 'text-blue-600' : 'text-slate-400'}`}>
                          {automationOn ? 'ENGAGED' : 'STANDBY'}
                        </h3>
                      </div>
                      <button 
                        onClick={() => {
                          const next = !automationOn;
                          setAutomationOn(next);
                          updateSettings({ auto_trade_on: next });
                        }}
                        className={`w-14 h-7 rounded-full relative transition-all duration-300 ${automationOn ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${automationOn ? 'left-8' : 'left-1'}`}></div>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold mt-4 leading-relaxed uppercase tracking-tight">
                      {automationOn 
                        ? 'System is scanning market depth for AI-driven trade execution.' 
                        : 'Rule engine is currently passive. Monitoring signals only.'}
                    </p>
                  </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
                  <div className="xl:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Alpha Traps Signals</h3>
                      <FilterBar 
                        options={[{label: 'ALL', value: 'all'}, {label: 'BULLISH', value: 'up'}]} 
                        activeValue={signalFilter} 
                        onSelect={setSignalFilter} 
                      />
                    </div>
                    <DataTable headers={['Asset', 'LTP', 'Technical Trend', 'System Status']}>
                      {Object.values(liveData)
                        .filter(s => s.pass && (signalFilter === 'all' || s.indicators?.trend === 'UP'))
                        .length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-24 text-xs font-black text-slate-300 uppercase tracking-widest">
                            No Active {signalFilter === 'up' ? 'Bullish' : ''} Signals Found
                          </td>
                        </tr>
                      ) : (
                        Object.values(liveData)
                          .filter(s => s.pass && (signalFilter === 'all' || s.indicators?.trend === 'UP'))
                          .map((stock, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-5 font-black text-slate-900">{stock.symbol}</td>
                            <td className="px-6 py-5 font-bold text-slate-600">₹{stock.price}</td>
                            <td className="px-6 py-5">
                              <div className={`flex items-center gap-2 font-black text-[11px] ${stock.indicators?.trend === 'UP' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {stock.indicators?.trend === 'UP' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                <span className="uppercase">{stock.indicators?.trend}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-200">PASS</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </DataTable>
                  </div>

                  <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Open Exposure</h3>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-xl border border-blue-100">{activeTrades.length} ACTIVE</span>
                    </div>
                    <DataTable headers={['Symbol', 'QTY', 'Entry', 'P&L']}>
                      {activeTrades.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-24 text-xs font-black text-slate-300 uppercase tracking-widest">No Active Positions</td>
                        </tr>
                      ) : (
                        activeTrades.map((trade, i) => {
                          const currentPrice = liveData[trade.symbol]?.price || trade.entry_price;
                          const qty = trade.quantity || 1;
                          const pnl = (currentPrice - trade.entry_price) * (trade.type === 'BUY' ? 1 : -1) * qty;
                          return (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <span className="font-black text-slate-900">{trade.symbol}</span>
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg ${trade.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{trade.type}</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 font-black text-slate-700">{qty}</td>
                              <td className="px-6 py-5 text-xs font-bold text-slate-400">₹{trade.entry_price}</td>
                              <td className="px-6 py-5 text-right font-black text-base">
                                <span className={pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                  {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </DataTable>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'watchlist' && (
              <motion.div 
                key="watchlist"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10 max-w-6xl"
              >
                <SearchBar 
                  value={searchQuery} 
                  onChange={setSearchQuery} 
                  onAction={() => handleAddSymbol(searchQuery)}
                  placeholder="Enter Scrip Name (e.g. RELIANCE, TCS)..."
                  actionLabel="Monitor Symbol"
                />

                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl max-w-4xl"
                    >
                      {suggestions.map((item, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => handleAddSymbol(item.tradingSymbol)}
                          className="p-5 flex justify-between items-center hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs uppercase">EQ</div>
                            <span className="font-black text-xl text-slate-900 uppercase tracking-tighter">{item.tradingSymbol}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NSE INDIA</span>
                            <ChevronRight size={16} className="text-slate-300" />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <DataTable headers={['Instrument Name', 'Live Price', 'Price Change', 'Actions']}>
                  {watchlist.map((item, i) => {
                    const current = liveData[item.symbol] || { price: 0, change: '0%', pass: false, side: 'NONE' };
                    const isPositive = current.change.startsWith('+') || (parseFloat(current.change) > 0);
                    const isNegative = current.change.startsWith('-') || (parseFloat(current.change) < 0);
                    
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-6 font-black text-slate-900 text-lg uppercase tracking-tighter">
                          <div className="flex flex-col">
                            <span>{item.symbol}</span>
                            {current.pass && (
                              <span className={`text-[10px] font-black ${current.side === 'SELL' ? 'bg-rose-500' : 'bg-emerald-500'} text-white px-2 py-0.5 rounded-md mt-1 w-fit animate-pulse`}>
                                {current.side === 'SELL' ? 'SELL SIGNAL 🔻' : 'BUY SIGNAL ✅'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6 font-bold text-slate-700 text-lg">₹{current.price || '0.00'}</td>
                        <td className={`px-6 py-6 font-black text-base ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-400'}`}>
                          <div className="flex items-center gap-2">
                            {isPositive ? <TrendingUp size={16} /> : isNegative ? <TrendingDown size={16} /> : <Activity size={16} />}
                            {current.change}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleManualTradeOpen(item.symbol, current.price)}
                              className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                            >
                              <Zap size={18} fill="currentColor" />
                            </button>
                            <button 
                              onClick={() => handleRemoveSymbol(item.symbol)}
                              className="text-slate-400 hover:text-rose-600 p-3 rounded-xl hover:bg-rose-50 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </DataTable>
              </motion.div>
            )}

            {/* TRADE MODAL */}
            <AnimatePresence>
              {tradeModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setTradeModal({ ...tradeModal, open: false })}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20"
                  >
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{tradeModal.symbol}</h2>
                          <p className="text-slate-400 font-bold">Manual Trade Execution</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{tradeModal.price}</p>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Market Price</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                          <Cpu className="text-blue-600" size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Instant Insight</span>
                        </div>
                        
                        {tradeModal.analysis === 'LOADING' ? (
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                          </div>
                        ) : tradeModal.analysis ? (
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tradeModal.analysis.sentiment === 'BUY' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                AI SUGGESTS: {tradeModal.analysis.sentiment}
                              </span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                CONFIDENCE: {tradeModal.analysis.confidenceScore || tradeModal.analysis.confidence}%
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-600 leading-relaxed">
                              {tradeModal.analysis.explanation}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-slate-400 italic">AI Analysis unavailable for this symbol.</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          disabled={isTrading}
                          onClick={() => handleManualTradeExecute('BUY')}
                          className="bg-emerald-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <TrendingUp size={20} />
                          Execute BUY
                        </button>
                        <button 
                          disabled={isTrading}
                          onClick={() => handleManualTradeExecute('SELL')}
                          className="bg-rose-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <TrendingDown size={20} />
                          Execute SELL
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-7xl"
              >
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Audit Logs</h3>
                    <p className="text-slate-500 font-bold text-sm">SETTLED AND HISTORICAL TRANSACTIONS</p>
                  </div>
                  <FilterBar 
                    options={[{label: 'ALL', value: 'all'}, {label: 'BOT', value: 'bot'}, {label: 'MANUAL', value: 'manual'}]} 
                    activeValue={historyFilter} 
                    onSelect={setHistoryFilter} 
                  />
                </div>
                <DataTable headers={['Timestamp', 'Security', 'Operation', 'QTY', 'Source', 'Settled Price']}>
                  {history.filter(item => {
                    if (historyFilter === 'all') return true;
                    if (historyFilter === 'bot') return item.trade_mode === 'BOT' || !item.trade_mode;
                    if (historyFilter === 'manual') return item.trade_mode === 'MANUAL';
                    return true;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-40">
                        <div className="flex flex-col items-center gap-6">
                          <HistoryIcon size={64} className="text-slate-100" />
                          <p className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">Historical Ledger Empty</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    history.filter(item => {
                      if (historyFilter === 'all') return true;
                      if (historyFilter === 'bot') return item.trade_mode === 'BOT' || !item.trade_mode;
                      if (historyFilter === 'manual') return item.trade_mode === 'MANUAL';
                      return true;
                    }).map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-6 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                          {new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-6 font-black text-slate-900 text-lg tracking-tighter">{item.symbol}</td>
                        <td className="px-6 py-6">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${item.type === 'BUY' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-6 font-black text-slate-700">{item.quantity || 1}</td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              {item.trade_mode === 'BOT' || !item.trade_mode ? <Cpu size={16} /> : <User size={16} />}
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              {item.trade_mode || 'AI ENGINE'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right font-black text-xl text-slate-900">₹{item.entry_price}</td>
                      </tr>
                    ))
                  )}
                </DataTable>
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div 
                key="activity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-7xl"
              >
                <div className="mb-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-2">System Ledger</h3>
                  <p className="text-slate-500 font-bold text-sm">REAL-TIME ACTIVITY AND DECISION LOGS</p>
                </div>

                <div 
                  className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
                  onScroll={(e: any) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                    if (scrollHeight - scrollTop <= clientHeight + 50) {
                      loadMoreLogs();
                    }
                  }}
                  style={{ height: '70vh', overflowY: 'auto' }}
                >
                  <div className="divide-y divide-slate-50">
                    {logs.map((log, i) => (
                      <div key={i} className="p-6 hover:bg-slate-50/50 transition-all flex items-start gap-4">
                        <div className={`mt-1 p-2 rounded-xl ${
                          log.level === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                          log.level === 'warn' ? 'bg-amber-50 text-amber-600' : 
                          log.level === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
                        }`}>
                          {log.level === 'success' ? <Zap size={16} /> : <Activity size={16} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {new Date(log.created_at).toLocaleTimeString()} • {log.symbol || 'SYSTEM'}
                            </span>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                              log.level === 'success' ? 'bg-emerald-100 text-emerald-700' : 
                              log.level === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {log.level}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-700 mb-2">{log.message}</p>
                          {log.data && (
                            <div className="bg-slate-900/5 rounded-xl p-3">
                              <pre className="text-[10px] font-mono text-slate-500 whitespace-pre-wrap">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {hasMoreLogs && (
                      <div className="p-10 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl space-y-12"
              >
                <div className="bg-white border border-slate-200 rounded-[40px] p-12 flex items-center gap-12 shadow-sm border-b-4 border-b-slate-100">
                  <div className="w-28 h-28 rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-blue-600/30">
                    A
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Axiino Pro</h2>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-xl">Licensed</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                      <span className="text-xs font-bold text-slate-400 tracking-widest">ID: 550E8400-XPRO</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-4">Advanced Configuration</h3>
                  
                  <div className="bg-white border border-slate-200 rounded-[32px] divide-y divide-slate-100 shadow-sm overflow-hidden">
                    <div className="p-10 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[24px] bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Wallet size={28} />
                        </div>
                        <div>
                          <p className="font-black text-xl text-slate-900 uppercase tracking-tighter">Trading Environment</p>
                          <p className="text-sm text-slate-500 font-bold mt-1">ISOLATE SESSIONS OR SYNC WITH REAL CAPITAL</p>
                        </div>
                      </div>
                      <FilterBar 
                        options={[{label: 'SANDBOX', value: 'PAPER'}, {label: 'LIVE', value: 'REAL'}]} 
                        activeValue={tradeMode} 
                        onSelect={(val) => { setTradeMode(val); updateSettings({ trade_mode: val }); }} 
                      />
                    </div>

                    <div className="p-10 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[24px] bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Activity size={28} />
                        </div>
                        <div>
                          <p className="font-black text-xl text-slate-900 uppercase tracking-tighter">Session Order Cap</p>
                          <p className="text-sm text-slate-500 font-bold mt-1">MAXIMUM AUTOMATED EXECUTIONS PER CYCLE</p>
                        </div>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={tradeLimit}
                          onChange={(e) => { setTradeLimit(e.target.value); updateSettings({ daily_trade_limit: parseInt(e.target.value) }); }}
                          className="w-28 bg-slate-50 border-2 border-slate-200 rounded-2xl py-5 px-6 text-center text-2xl font-black outline-none focus:border-blue-600 focus:ring-8 ring-blue-600/5 transition-all text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="p-10 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[24px] bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap size={28} />
                        </div>
                        <div>
                          <p className="font-black text-xl text-slate-900 uppercase tracking-tighter">Scan Intelligence</p>
                          <p className="text-sm text-slate-500 font-bold mt-1">SWITCH BETWEEN HIGH-CONVICTION OR VOLUME SIGNALS</p>
                        </div>
                      </div>
                      <FilterBar 
                        options={[{label: 'CONSERVATIVE', value: 'STRICT'}, {label: 'AGGRESSIVE', value: 'RELAXED'}]} 
                        activeValue={scanMode} 
                        onSelect={(val) => { setScanMode(val); updateSettings({ scan_mode: val }); }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-12 bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                  <ShieldCheck size={40} className="text-slate-200" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Secure Configuration Node</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Nav - Floating Style */}
      <nav className="mobile-tabs shadow-[0_-15px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl bg-white/90">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`mobile-tab-btn px-6 py-2 rounded-2xl transition-all ${activeTab === item.id ? 'active bg-blue-50' : 'opacity-60'}`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'fill-blue-600/5' : ''} />
            <span className="uppercase tracking-tighter font-black mt-1">{item.id === 'dashboard' ? 'Home' : item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
