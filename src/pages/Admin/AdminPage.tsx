import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, CreditCard, Activity, CheckCircle, XCircle } from 'lucide-react';
import { BACKEND_URL } from '../../config';
import { Card } from '../../components/Common';

interface AdminPageProps {
  authToken: string;
}

const AdminPage: React.FC<AdminPageProps> = ({ authToken }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, [authToken]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const [paymentsRes, statsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/admin/payments`, { headers }),
        axios.get(`${BACKEND_URL}/admin/stats`, { headers })
      ]);
      setPayments(paymentsRes.data || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAction = async (id: string, action: 'approve' | 'reject') => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    
    try {
      await axios.post(
        `${BACKEND_URL}/admin/payments/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      alert(`Payment ${action}d successfully!`);
      fetchAdminData(); // Refresh data
    } catch (error: any) {
      alert(`Failed to ${action}: ` + (error.response?.data?.error || error.message));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <div className="mb-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Command Center</h3>
        <p className="text-slate-500 font-bold text-sm">SYSTEM OVERVIEW & REQUEST MANAGEMENT</p>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col justify-between min-h-[140px] border-l-4 border-l-blue-600">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Users</span>
            <Users size={18} className="text-blue-500" />
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.totalUsers || 0}</h4>
          </div>
        </Card>
        
        <Card className="flex flex-col justify-between min-h-[140px] border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Upgrades</span>
            <CreditCard size={18} className="text-emerald-500" />
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.pendingPayments || 0}</h4>
          </div>
        </Card>

        <Card className="flex flex-col justify-between min-h-[140px] border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Trades</span>
            <Activity size={18} className="text-amber-500" />
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.activeTrades || 0}</h4>
          </div>
        </Card>

        <Card className="flex flex-col justify-between min-h-[140px] bg-slate-900 text-white border-none shadow-xl shadow-blue-900/10">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Net P&L</span>
            <Activity size={18} className="text-blue-500" />
          </div>
          <div className="mt-4">
            <h4 className={`text-3xl font-black tracking-tighter ${parseFloat(stats.totalNetPnl) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {parseFloat(stats.totalNetPnl) >= 0 ? '+' : ''}₹{stats.totalNetPnl || 0}
            </h4>
          </div>
        </Card>
      </div>

      {/* PAYMENT REQUESTS */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Subscription & Payment Requests</h3>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">User</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Txn ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Note / Request</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400 text-xs font-bold">Loading data...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">No payment requests found</td></tr>
                ) : payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-sm text-slate-900 dark:text-white">{payment.app_users?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-400">{payment.app_users?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                      {payment.transaction_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                      {payment.note || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest
                        ${payment.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                          payment.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}
                      `}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handlePaymentAction(payment.id, 'approve')}
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                            title="Approve & Upgrade"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handlePaymentAction(payment.id, 'reject')}
                            className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;
