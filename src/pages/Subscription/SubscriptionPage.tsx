import React from 'react';
import { motion } from 'framer-motion';
import { Zap, QrCode, CreditCard } from 'lucide-react';

interface SubscriptionPageProps {
  authUser: any;
  paymentConfig: any;
  setShowUpgradeModal: (show: boolean) => void;
  setPendingPlan: (plan: string) => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ 
  authUser, 
  paymentConfig, 
  setShowUpgradeModal, 
  setPendingPlan 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto py-10"
    >
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Choose Your Power</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Elevate your trading with AI-driven intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        {/* Starter Plan */}
        <div className={`bg-white dark:bg-slate-900 border ${authUser?.plan_tier === 'STARTER' ? 'border-blue-600' : 'border-slate-200 dark:border-slate-800'} rounded-[40px] p-10 flex flex-col justify-between hover:scale-105 transition-transform shadow-xl`}>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tier 01</span>
              {authUser?.plan_tier === 'STARTER' && <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase">Active</span>}
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 uppercase">Starter</h3>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-black text-slate-900 dark:text-white">Free</span>
            </div>
            <ul className="mt-8 space-y-4">
              {['Paper Trading Only', 'Standard Indicators', '5-min Scan Delay', '5 Daily Trade Limit'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div> {f}
                </li>
              ))}
            </ul>
          </div>
          <button 
            onClick={() => { setPendingPlan('STARTER'); setShowUpgradeModal(true); }}
            disabled={authUser?.plan_tier === 'STARTER'} 
            className={`mt-12 w-full py-5 rounded-2xl ${authUser?.plan_tier === 'STARTER' ? 'bg-slate-50 dark:bg-slate-800 text-slate-400' : 'bg-slate-900 text-white'} font-black text-sm uppercase tracking-widest transition-all`}
          >
            {authUser?.plan_tier === 'STARTER' ? 'Current Plan' : 'Select Plan'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className={`bg-slate-900 dark:bg-blue-600 border ${authUser?.plan_tier === 'PRO' ? 'border-white' : 'border-slate-800 dark:border-blue-500'} rounded-[40px] p-10 flex flex-col justify-between scale-105 shadow-2xl shadow-blue-500/20 relative overflow-hidden`}>
          <div className="absolute top-8 right-8 bg-blue-500 dark:bg-white/20 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Popular</div>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-slate-400 dark:text-white/50 uppercase tracking-[0.3em]">Tier 02</span>
              {authUser?.plan_tier === 'PRO' && <span className="bg-white text-blue-600 text-[8px] font-black px-2 py-1 rounded-lg uppercase">Active</span>}
            </div>
            <h3 className="text-3xl font-black text-white mt-2 uppercase tracking-tighter">Professional</h3>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-black text-white">₹1,999</span>
              <span className="text-sm font-bold text-slate-400 dark:text-white/50">/month</span>
            </div>
            <ul className="mt-8 space-y-4">
              {['Real Trading Enabled', 'Real-time Scanning', 'Unlimited Executions', 'Risk Management Engine', 'Priority Telegram Alerts'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-300 dark:text-white/80">
                  <div className="w-2 h-2 rounded-full bg-blue-400 dark:bg-white"></div> {f}
                </li>
              ))}
            </ul>
          </div>
          <button 
            onClick={() => { setPendingPlan('PRO'); setShowUpgradeModal(true); }}
            disabled={authUser?.plan_tier === 'PRO'} 
            className="mt-12 w-full py-5 rounded-2xl bg-blue-500 dark:bg-white text-white dark:text-blue-600 font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
          >
            {authUser?.plan_tier === 'PRO' ? 'Current Plan' : 'Upgrade Now'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionPage;
