import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ShieldAlert, KeyRound, UserSquare2, Lock, Smartphone } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';

interface ProfilePageProps {
  authToken: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ authToken }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: '',
    password: '',
    totp_secret: '',
    api_key: '',
    angel_secret: '',
    telegram_bot_token: '',
    telegram_chat_id: ''
  });

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/profile/broker`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.data && res.data.client_id) {
        setFormData({
          client_id: res.data.client_id || '',
          password: res.data.password || '',
          totp_secret: res.data.totp_secret || '',
          api_key: res.data.api_key || '',
          angel_secret: res.data.angel_secret || '',
          telegram_bot_token: res.data.telegram_bot_token || '',
          telegram_chat_id: res.data.telegram_chat_id || ''
        });
      }
    } catch (e) {
      console.error('Failed to fetch broker credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${BACKEND_URL}/profile/broker`, formData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      alert('Broker & Alert Credentials Saved Successfully!');
    } catch (e: any) {
      alert('Save failed: ' + (e?.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-900 dark:text-white">Loading Profile...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pb-20">
      
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Broker Integration</h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Connect your Angel One Trading Account</p>
      </div>

      <div className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <ShieldAlert className="text-blue-400" size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Secure Credential Vault</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 max-w-xl leading-relaxed">
              Your API keys and passwords are encrypted and stored securely. The system uses these credentials exclusively to execute trades on your behalf. We do not have access to withdraw your funds.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <UserSquare2 size={12} /> Angel One Client ID
              </label>
              <input 
                type="text" 
                value={formData.client_id}
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                placeholder="e.g. S54321"
                className="w-full bg-slate-50 dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Lock size={12} /> Account PIN / Password
              </label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Smartphone size={12} /> SmartAPI TOTP Secret
            </label>
            <input 
              type="password" 
              value={formData.totp_secret}
              onChange={(e) => setFormData({...formData, totp_secret: e.target.value})}
              placeholder="e.g. JBSWY3DPEHPK3PXP"
              className="w-full bg-slate-50 dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Get this from the Angel One SmartAPI Dashboard</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <KeyRound size={12} /> Trading API Key
              </label>
              <input 
                type="password" 
                value={formData.api_key}
                onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                placeholder="Your SmartAPI Key"
                className="w-full bg-slate-50 dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldAlert size={12} /> App Secret (MAC / Secret)
              </label>
              <input 
                type="password" 
                value={formData.angel_secret}
                onChange={(e) => setFormData({...formData, angel_secret: e.target.value})}
                placeholder="e.g. 2e8efee4-69b6-4123-..."
                className="w-full bg-slate-50 dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/50 mt-8">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">Telegram Alerts (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Telegram Bot Token</label>
                <input 
                  type="password" 
                  value={formData.telegram_bot_token}
                  onChange={(e) => setFormData({...formData, telegram_bot_token: e.target.value})}
                  placeholder="e.g. 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="w-full bg-slate-50 dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Telegram Chat ID</label>
                <input 
                  type="text" 
                  value={formData.telegram_chat_id}
                  onChange={(e) => setFormData({...formData, telegram_chat_id: e.target.value})}
                  placeholder="e.g. -100123456789"
                  className="w-full bg-slate-50 dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/50 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50"
          >
            {saving ? 'Encrypting...' : 'Save Configuration'}
            <Save size={14} />
          </button>
        </div>

      </div>
    </motion.div>
  );
};
