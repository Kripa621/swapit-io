import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, TrendingUp, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import PageWrapper, { THEME } from '../components/layout/PageWrapper';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
  const { user } = useAuth(); // Get current user context
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock History Data (Placeholder for Phase 4)
  const transactions = [
    { id: 1, type: 'reward', title: 'High Value Trade Reward', amount: 50, date: 'Today' },
    { id: 2, type: 'deduction', title: 'Security Deposit (Escrow)', amount: -500, date: 'Yesterday' },
    { id: 3, type: 'refund', title: 'Escrow Refund', amount: 500, date: 'Yesterday' },
  ];

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Re-fetch user details to get latest balance
        const { data } = await api.get('/auth/me');
        setBalance(data.creditBalance || 0);
      } catch (error) {
        console.error("Failed to fetch balance", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
            <WalletIcon className="text-emerald-900" size={32} />
            My Wallet
          </h1>
          <p className="text-emerald-800/60 font-medium ml-1">Manage your credits and rewards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Balance Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`md:col-span-3 p-8 rounded-[32px] ${THEME.glass} relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <WalletIcon size={120} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900/50">Available Balance</h2>
              <div className="text-6xl font-black text-emerald-900 mt-2 flex items-baseline gap-2">
                {loading ? "..." : balance}
                <span className="text-2xl font-bold text-emerald-900/40">Credits</span>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="px-6 py-3 bg-emerald-900 text-[#F7F5E6] rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-colors">
                  Add Funds
                </button>
                <button className="px-6 py-3 bg-white/40 text-emerald-900 rounded-xl font-bold text-sm hover:bg-white/60 transition-colors">
                  Withdraw
                </button>
              </div>
            </div>
          </motion.div>

          {/* Transaction History */}
          <div className={`md:col-span-3 p-6 rounded-[32px] ${THEME.glass}`}>
            <h3 className="text-lg font-bold text-emerald-950 mb-4 flex items-center gap-2">
              <History size={20} />
              Recent Activity
            </h3>

            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl hover:bg-white/60 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {tx.amount > 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <div className="font-bold text-emerald-900">{tx.title}</div>
                      <div className="text-xs font-bold text-emerald-900/40">{tx.date}</div>
                    </div>
                  </div>
                  <div className={`font-black text-lg ${tx.amount > 0 ? 'text-emerald-700' : 'text-emerald-900/40'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

export default Wallet;