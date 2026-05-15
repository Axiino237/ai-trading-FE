import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Bell, Sun, Moon, QrCode, CreditCard, Activity, LayoutDashboard, ListTree, History as HistoryIcon, Settings as SettingsIcon, ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';

// Config
import { BACKEND_URL, SOCKET_URL } from './config';

// Components & Pages
import { Sidebar } from './components/Sidebar';
import { DashboardPage, WatchlistPage } from './pages/Dashboard/DashboardPage';

import HistoryPage from './pages/History/HistoryPage';
import SubscriptionPage from './pages/Subscription/SubscriptionPage';
import SettingsPage from './pages/Settings/SettingsPage';
import LoginPage from './pages/Auth/LoginPage';
import AdminPage from './pages/Admin/AdminPage';
import LogsPage from './pages/Admin/LogsPage';
import { ProfilePage } from './pages/Profile/ProfilePage';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  plan_tier?: 'STARTER' | 'PRO';
}

const App: React.FC = () => {
  // Theme & UI States
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('stocksDarkMode');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<any>(null);
  const [upgradeTxnId, setUpgradeTxnId] = useState('');

  // Auth States
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('stocksProAuthToken') || '');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');

  // Data States
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [liveData, setLiveData] = useState<any>({});
  const [trades, setTrades] = useState<any[]>([]);
  const [walletLogs, setWalletLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [tradeMode, setTradeMode] = useState('PAPER');
  const [scanMode, setScanMode] = useState('STRICT');
  const [maxTrades, setMaxTrades] = useState(5);
  const [orderType, setOrderType] = useState('LIMIT');
  const [smartMode, setSmartMode] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<any>({});
  const [stats, setStats] = useState({ totalBalance: 0, todayPnl: 0, investedCapital: 0, activeTrades: 0 });

  const [manualTradeSymbol, setManualTradeSymbol] = useState<string | null>(null);
  const [tradeQty, setTradeQty] = useState<number>(1);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Init
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('stocksDarkMode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (authToken) {
      fetchUser();
      fetchData();
      const socket = io(SOCKET_URL);
      socket.on('symbol-status', (data) => {
        setLiveData((prev: any) => ({ ...prev, [data.symbol]: data }));
      });
      return () => { socket.disconnect(); };
    }
  }, [authToken]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const timer = setTimeout(() => searchSymbols(searchQuery), 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  let navItems = [
    { id: 'dashboard', label: 'Terminal', icon: LayoutDashboard },
    { id: 'watchlist', label: 'Watchlist', icon: ListTree },
    { id: 'orders', label: 'History', icon: HistoryIcon },
    { id: 'subscription', label: 'Membership', icon: Zap },
    { id: 'admin', label: 'Command Center', icon: ShieldAlert },
    { id: 'logs', label: 'Audit Logs', icon: Activity },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  if (authUser?.role === 'ADMIN') {
    navItems = navItems.filter(i => i.id !== 'subscription');
  } else {
    navItems = navItems.filter(i => i.id !== 'admin' && i.id !== 'logs');
  }

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/auth/me`, { headers: { Authorization: `Bearer ${authToken}` } });
      setAuthUser(res.data.user);
    } catch (e) {
      handleLogout();
    }
  };

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${authToken}` };

    // Independent fetches — oru call fail aanalum matha ellam work aagum
    try {
      const wl = await axios.get(`${BACKEND_URL}/watchlist`, { headers });
      setWatchlist(wl.data || []);
    } catch (e) { console.warn('[fetchData] watchlist failed:', e); }

    try {
      const tr = await axios.get(`${BACKEND_URL}/history`, { headers });
      const trades = tr.data || [];
      setTrades(trades);
      const active = trades.filter((t: any) => t.status === 'OPEN').length;

      let investedReal = 0;
      let investedPaper = 0;
      trades.filter((t: any) => t.status === 'OPEN').forEach((t: any) => {
        const amt = t.entry_price * (t.quantity || 1);
        if (t.side === 'REAL' || t.trading_type === 'REAL') investedReal += amt;
        else investedPaper += amt;
      });

      setStats(prev => ({ ...prev, activeTrades: active, invested_real: investedReal, invested_paper: investedPaper }));
    } catch (e) { console.warn('[fetchData] history failed:', e); }

    try {
      const wlgs = await axios.get(`${BACKEND_URL}/wallet/logs`, { headers });
      const logs = wlgs.data || [];
      setWalletLogs(logs);
      if (logs.length > 0) {
        setStats(prev => ({ ...prev, totalBalance: logs[0].balance_after }));
      }
    } catch (e) { console.warn('[fetchData] wallet/logs failed:', e); }

    try {
      const balanceRes = await axios.get(`${BACKEND_URL}/balances`, { headers });
      if (balanceRes.data) {
        setStats(prev => ({
          ...prev,
          paper: balanceRes.data.paper,
          real: balanceRes.data.real,
          mode: balanceRes.data.mode,
          investedCapital: balanceRes.data.invested,
          totalProfit: balanceRes.data.totalProfit,
          totalEquity: balanceRes.data.totalEquity
        }));
      }
    } catch (e) { console.warn('[fetchData] balances failed:', e); }

    try {
      const sets = await axios.get(`${BACKEND_URL}/settings`, { headers });
      setTradeMode(sets.data.trade_mode || 'PAPER');
      setScanMode(sets.data.scan_mode || 'STRICT');
      setMaxTrades(sets.data.daily_trade_limit || 5);
      setOrderType(sets.data.order_type || 'LIMIT');
      setSmartMode(sets.data.smart_mode || false);
    } catch (e) { console.warn('[fetchData] settings failed:', e); }

    try {
      const pcfg = await axios.get(`${BACKEND_URL}/payment-config`, { headers });
      setPaymentConfig(pcfg.data || {});
    } catch (e) { console.warn('[fetchData] payment-config failed:', e); }

    try {
      const broker = await axios.get(`${BACKEND_URL}/profile/broker`, { headers });
      if (broker.data && broker.data.client_id) {
        setStats(prev => ({ ...prev, angelOneId: broker.data.client_id }));
      }
    } catch (e) { console.warn('[fetchData] broker failed:', e); }

    try {
      const rms = await axios.get(`${BACKEND_URL}/profile/broker/rms`, { headers });
      if (rms.data) {
        setStats(prev => ({ ...prev, real: rms.data.availableCash }));
      }
    } catch (e) { console.warn('[fetchData] rms failed:', e); }
  };

  const searchSymbols = async (q: string) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/search?query=${q}`);
      setSuggestions(res.data);
    } catch (e) { }
  };

  const handleAddSymbol = async (sym: string) => {
    try {
      await axios.post(`${BACKEND_URL}/watchlist`, { symbol: sym }, { headers: { Authorization: `Bearer ${authToken}` } });
      setSearchQuery('');
      setSuggestions([]);
      fetchData();
    } catch (e) { }
  };

  const handleRemoveSymbol = async (sym: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/watchlist/${sym}`, { headers: { Authorization: `Bearer ${authToken}` } });
      fetchData();
    } catch (e) { }
  };

  const updateSettings = async (updates: any) => {
    try {
      await axios.post(`${BACKEND_URL}/settings`, updates, { headers: { Authorization: `Bearer ${authToken}` } });
      console.log('[Settings] Updated:', updates);
    } catch (e: any) {
      console.error('[Settings] Update failed:', e?.response?.data || e?.message);
      alert('Settings update failed: ' + (e?.response?.data?.error || e?.message || 'Unknown error'));
    }
  };

  const handleManualTradeOpen = async (symbol: string, price: number, type: 'BUY' | 'SELL', quantity: number, sl?: number, tp?: number, holdingType?: string, duration?: string, manualOrderType?: string) => {
    try {
      await axios.post(`${BACKEND_URL}/trade/manual`, { 
        symbol, price, type, quantity, sl, tp, holdingType, expectedDuration: duration, orderType: manualOrderType || orderType 
      }, { headers: { Authorization: `Bearer ${authToken}` } });
      alert('Manual Trade Opened!');
      fetchData();
    } catch (e: any) { alert(e.response?.data?.error || 'Trade Failed'); }
  };

  const handleTradeClose = async (tradeId: number) => {
    try {
      await axios.post(`${BACKEND_URL}/trade/close`, { tradeId }, { headers: { Authorization: `Bearer ${authToken}` } });
      alert('Trade Exited Successfully!');
      fetchData();
    } catch (e: any) { alert(e.response?.data?.error || 'Exit Failed'); }
  };

  const handleAuth = async () => {
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload = authMode === 'login' ? { email: authEmail, password: authPass } : { name: authName, email: authEmail, password: authPass };
      const res = await axios.post(`${BACKEND_URL}${endpoint}`, payload);
      localStorage.setItem('stocksProAuthToken', res.data.token);
      setAuthToken(res.data.token);
    } catch (e) { alert('Authentication Failed'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('stocksProAuthToken');
    setAuthToken('');
    setAuthUser(null);
  };

  if (!authToken || !authUser) {
    return (
      <LoginPage
        authMode={authMode} setAuthMode={setAuthMode}
        authName={authName} setAuthName={setAuthName}
        authEmail={authEmail} setAuthEmail={setAuthEmail}
        authPass={authPass} setAuthPass={setAuthPass}
        handleAuth={handleAuth}
        isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
      />
    );
  }



  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-300">
      <Sidebar
        activeTab={activeTab} setActiveTab={setActiveTab}
        authUser={authUser} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
        handleLogout={handleLogout}
        navItems={navItems}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <header className="px-4 md:px-10 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between min-h-[72px]">
          <div className="flex items-center gap-4">
            {/* MOBILE MENU BUTTON */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
            >
              <Activity size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Global Market Terminal v4.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Live</span>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="relative p-2 text-slate-400">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <DashboardPage
                stats={stats} trades={trades} liveData={liveData}
                scanMode={scanMode} setScanMode={setScanMode}
                watchlist={watchlist}
                updateSettings={updateSettings}
                handleTradeClose={handleTradeClose}

                handleRemoveSymbol={handleRemoveSymbol}
                setManualTradeSymbol={setManualTradeSymbol}
              />
            )}
            {activeTab === 'watchlist' && (
              <WatchlistPage
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                handleAddSymbol={handleAddSymbol} suggestions={suggestions}
                watchlist={watchlist} liveData={liveData}

                handleRemoveSymbol={handleRemoveSymbol}
                setManualTradeSymbol={setManualTradeSymbol}
              />
            )}
            {activeTab === 'orders' && <HistoryPage trades={trades} liveData={liveData} walletLogs={walletLogs} />}
            {activeTab === 'subscription' && (
              <SubscriptionPage
                authUser={authUser}
                setShowUpgradeModal={setShowUpgradeModal} setPendingPlan={setPendingPlan}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsPage
                tradeMode={tradeMode} setTradeMode={setTradeMode}
                scanMode={scanMode} setScanMode={setScanMode}
                maxTrades={maxTrades} setMaxTrades={setMaxTrades}
                orderType={orderType} setOrderType={setOrderType}
                smartMode={smartMode} setSmartMode={setSmartMode}
                updateSettings={updateSettings}
                authUser={authUser}
              />
            )}
            {activeTab === 'admin' && <AdminPage authToken={authToken} />}
            {activeTab === 'logs' && <LogsPage authToken={authToken} />}
            {activeTab === 'profile' && <ProfilePage authToken={authToken} />}
          </AnimatePresence>
        </main>
      </div>


      {/* UPGRADE MODAL */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUpgradeModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-md p-10 text-center shadow-3xl border border-white/20 dark:border-slate-800">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-blue-600/30"><Zap size={40} className="text-white fill-white" /></div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Upgrade to {pendingPlan}</h3>
              <div className="mt-8 bg-slate-50 dark:bg-slate-950/60 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                <div className="aspect-square bg-white rounded-2xl p-4 mb-6 flex items-center justify-center overflow-hidden border-2 border-slate-100">
                  {paymentConfig.qrUrl ? <img src={paymentConfig.qrUrl} alt="QR" className="w-full h-full object-contain" /> : <QrCode size={48} className="opacity-20" />}
                </div>
                <div onClick={() => { navigator.clipboard.writeText(paymentConfig.upiId); alert('Copied!'); }} className="bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer flex justify-between items-center">
                  <span className="text-xs font-black truncate">{paymentConfig.upiId || 'not.set@bank'}</span>
                  <CreditCard size={16} className="text-blue-600" />
                </div>
                <input type="text" value={upgradeTxnId} onChange={(e) => setUpgradeTxnId(e.target.value)} className="mt-6 w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 text-xl font-black outline-none focus:border-blue-600" placeholder="Transaction ID" />
              </div>
              <button onClick={async () => {
                if (!upgradeTxnId) return alert('Enter Txn ID');
                try {
                  await axios.post(`${BACKEND_URL}/payments/request`, { amount: pendingPlan === 'PRO' ? 1999 : 0, transaction_id: upgradeTxnId, note: `SUBSCRIPTION_UPGRADE:${pendingPlan}` }, { headers: { Authorization: `Bearer ${authToken}` } });
                  alert('Request Sent!'); setShowUpgradeModal(false); setUpgradeTxnId('');
                } catch (e) { alert('Failed'); }
              }} className="mt-8 w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest">Submit & Upgrade</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL MANUAL TRADE MODAL */}
      <AnimatePresence>
        {manualTradeSymbol && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => { setManualTradeSymbol(null); setAiAnalysis(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#0B1120] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-blue-600/20 blur-[60px] rounded-full pointer-events-none"></div>

              {(() => {
                const current = liveData[manualTradeSymbol] || { price: 0 };
                const price = parseFloat(current.price) || 0;

                // Fetch AI Analysis automatically when modal opens
                if (!aiAnalysis && !isAnalyzing) {
                  setIsAnalyzing(true);
                  axios.post(`${BACKEND_URL}/analyze`, { symbol: manualTradeSymbol }, { headers: { Authorization: `Bearer ${authToken}` } })
                    .then(res => {
                      setAiAnalysis(res.data);
                      setIsAnalyzing(false);
                    })
                    .catch(() => {
                      setIsAnalyzing(false);
                      // Fallback if AI fails
                      setAiAnalysis({
                        sentiment: 'NEUTRAL', confidenceScore: 50,
                        explanation: 'AI Analysis temporarily unavailable.',
                        sl: price * 0.98, tp: price * 1.02,
                        holdingType: 'Unknown', expectedDuration: 'N/A'
                      });
                    });
                }

                const aiSide = isAnalyzing ? 'ANALYZING' : (aiAnalysis?.sentiment === 'BULLISH' ? 'BUY' : aiAnalysis?.sentiment === 'BEARISH' ? 'SELL' : 'NEUTRAL');
                const confidence = isAnalyzing ? '...' : (aiAnalysis?.confidenceScore || 0);
                const suggestionText = isAnalyzing ? 'Fetching 5-day market data and running AI analysis... Please wait.' : (aiAnalysis?.explanation || 'Analyzing market conditions...');
                const durationType = aiAnalysis?.holdingType || '...';
                const expectedTime = aiAnalysis?.expectedDuration || '...';

                const target = aiAnalysis?.tp ? aiAnalysis.tp.toFixed(2) : (price * 1.04).toFixed(2);
                const sl = aiAnalysis?.sl ? aiAnalysis.sl.toFixed(2) : (price * 0.98).toFixed(2);

                return (
                  <>
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <h2 className="text-2xl font-black tracking-tighter text-white">{manualTradeSymbol}</h2>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Manual Trade Execution</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-white">₹{price.toFixed(2)}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Market Price</p>
                      </div>
                    </div>

                    <div className="bg-[#131B2C] border border-slate-800 rounded-2xl p-5 mb-8 relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1 rounded bg-blue-500/10 text-blue-400">
                          <Activity size={14} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Instant Insight</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg ${aiSide === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : aiSide === 'SELL' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'}`}>
                          AI Suggests: {aiSide}
                        </span>
                        <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-blue-500/10 text-blue-400">
                          {durationType}
                        </span>
                        <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-purple-500/10 text-purple-400">
                          Hit In: {expectedTime}
                        </span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                          Confidence: {confidence}{isAnalyzing ? '' : '%'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-400 leading-relaxed mt-2 border-t border-slate-800 pt-3">
                        {suggestionText}
                      </p>
                    </div>

                    <div className="mb-8 relative z-10">
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Order Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={tradeQty}
                        onChange={(e) => setTradeQty(parseInt(e.target.value) || 1)}
                        className="w-full bg-[#131B2C] border border-slate-800 rounded-xl px-5 py-4 text-white text-center font-black text-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                      />
                    </div>

                    {isAnalyzing ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                        {aiSide === 'BUY' || aiSide === 'NEUTRAL' ? (
                          <div className="bg-gradient-to-b from-[#131B2C] to-[#0A171D] border border-emerald-900/30 rounded-2xl p-5 border-l-4 border-l-emerald-500 col-span-2">
                            <div className="inline-block px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded mb-4">
                              AI Buy Scenario
                            </div>
                            <div className="flex justify-between items-center space-y-3">
                              <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target</p>
                                <p className="text-xl font-black text-emerald-400">₹{target}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Stop Loss</p>
                                <p className="text-xl font-black text-rose-400">₹{sl}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-b from-[#131B2C] to-[#1D0A0F] border border-rose-900/30 rounded-2xl p-5 border-l-4 border-l-rose-500 col-span-2">
                            <div className="inline-block px-2 py-1 bg-rose-500/10 text-rose-400 text-[9px] font-black uppercase tracking-widest rounded mb-4">
                              AI Sell Scenario
                            </div>
                            <div className="flex justify-between items-center space-y-3">
                              <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target</p>
                                <p className="text-xl font-black text-emerald-400">₹{target}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Stop Loss</p>
                                <p className="text-xl font-black text-rose-400">₹{sl}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      <button
                        onClick={() => {
                          handleManualTradeOpen(manualTradeSymbol, price, 'BUY', tradeQty);
                          setManualTradeSymbol(null);
                          setAiAnalysis(null);
                        }}
                        className="py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                      >
                        <TrendingUp size={16} /> Execute Buy
                      </button>
                      <button
                        onClick={() => {
                          handleManualTradeOpen(manualTradeSymbol, price, 'SELL', tradeQty);
                          setManualTradeSymbol(null);
                          setAiAnalysis(null);
                        }}
                        className="py-4 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center gap-2"
                      >
                        <TrendingDown size={16} /> Execute Sell
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default App;
