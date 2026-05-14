import React from 'react';
import { motion } from 'framer-motion';
import { Zap, User, Moon, Sun } from 'lucide-react';

interface LoginPageProps {
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authName: string;
  setAuthName: (val: string) => void;
  authEmail: string;
  setAuthEmail: (val: string) => void;
  authPass: string;
  setAuthPass: (val: string) => void;
  handleAuth: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  authMode,
  setAuthMode,
  authName,
  setAuthName,
  authEmail,
  setAuthEmail,
  authPass,
  setAuthPass,
  handleAuth,
  isDarkMode,
  setIsDarkMode
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
      <div className="absolute top-10 right-10">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl text-slate-500 hover:text-blue-600 transition-all"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[48px] p-10 md:p-14 shadow-2xl border border-white dark:border-slate-800 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/40">
            <Zap size={32} className="text-white fill-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Stocks Pro</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Enterprise Trading Terminal</p>
        </div>

        <div className="space-y-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${authMode === 'login' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${authMode === 'register' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Register
            </button>
          </div>

          <div className="space-y-4">
            {authMode === 'register' && (
              <input
                type="text"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 outline-none focus:border-blue-600 dark:focus:border-blue-500 font-bold transition-all"
                placeholder="Full Name"
              />
            )}
            <input
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 outline-none focus:border-blue-600 dark:focus:border-blue-500 font-bold transition-all"
              placeholder="Email Address"
            />
            <input
              type="password"
              value={authPass}
              onChange={(e) => setAuthPass(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 outline-none focus:border-blue-600 dark:focus:border-blue-500 font-bold transition-all"
              placeholder="Security Key"
            />
          </div>

          <button
            onClick={handleAuth}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
          >
            {authMode === 'login' ? 'Initialize Session' : 'Create Enterprise Account'}
          </button>

          <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6">
            Protected by Advanced AI Risk Management
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
