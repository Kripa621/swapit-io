import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowRightLeft, TrendingUp, Wallet, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageWrapper, { THEME } from '../components/layout/PageWrapper';
import ItemCard from '../components/items/ItemCard';
import TradeRequestCard from '../components/trades/TradeRequestCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [myItems, setMyItems] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  const fetchData = async () => {
    try {
      const [itemsRes, tradesRes] = await Promise.all([
        api.get('/items/myitems'),
        api.get('/trades')
      ]);
      setMyItems(itemsRes.data);
      setTrades(tradesRes.data);
    } catch (error) {
      console.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Trades (Robust Version)
  const incomingTrades = trades.filter(t => {
    // Handle if receiver is an Object (populated) or just an ID String
    const receiverId = t.receiver?._id || t.receiver;
    return receiverId === user?._id;
  });

  const sentTrades = trades.filter(t => {
    const requesterId = t.requester?._id || t.requester;
    return requesterId === user?._id;
  });

 

  // Stats
  const totalValue = myItems.reduce((sum, item) => sum + item.estimatedValue, 0);

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        
        {/* --- Header & Stats --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2">
             <h1 className="text-4xl font-black text-emerald-950 mb-2">Hello, {user?.username}</h1>
             <p className="text-emerald-900/60 font-medium">Here is what's happening in your ecosystem.</p>
          </div>
          
          {/* Wallet Card */}
          <div className={`p-6 rounded-[24px] bg-emerald-900 text-[#F7F5E6] shadow-xl relative overflow-hidden`}>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
               <div className="flex items-center gap-2 text-emerald-200/80 mb-1 text-sm font-bold uppercase tracking-wider">
                 <Wallet size={16} /> Credit Balance
               </div>
               <div className="text-4xl font-black">₹{user?.creditBalance || 0}</div>
               <div className="text-xs text-emerald-200/60 mt-2 font-medium">
                 Total Asset Value: ₹{totalValue}
               </div>
             </div>
          </div>
        </div>

        {/* --- Tabs --- */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
               activeTab === 'inventory' 
                 ? 'bg-white shadow-md text-emerald-900' 
                 : 'bg-white/40 text-emerald-900/60 hover:bg-white/60'
            }`}
          >
            <Package size={18} /> My Inventory
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-xs">{myItems.length}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
               activeTab === 'incoming' 
                 ? 'bg-white shadow-md text-emerald-900' 
                 : 'bg-white/40 text-emerald-900/60 hover:bg-white/60'
            }`}
          >
            <ArrowRightLeft size={18} /> Incoming Requests
            {incomingTrades.length > 0 && (
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs animate-pulse">{incomingTrades.length}</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
               activeTab === 'sent' 
                 ? 'bg-white shadow-md text-emerald-900' 
                 : 'bg-white/40 text-emerald-900/60 hover:bg-white/60'
            }`}
          >
            <TrendingUp size={18} /> Sent Requests
          </button>
        </div>

        {/* --- Content Area --- */}
        <div className="min-h-[400px]">
          {loading ? (
             <div className="text-center py-20 text-emerald-900/40">Loading ecosystem...</div>
          ) : (
            <AnimatePresence mode='wait'>
              
              {/* INVENTORY TAB */}
              {activeTab === 'inventory' && (
                <motion.div 
                   key="inventory" 
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                   className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                   {/* Add New Item Card */}
                   <button 
                     onClick={() => navigate('/create-listing')}
                     className="min-h-[300px] rounded-[24px] border-2 border-dashed border-emerald-900/20 flex flex-col items-center justify-center gap-3 text-emerald-900/40 hover:bg-white/40 hover:border-emerald-900/40 hover:text-emerald-900 transition-all group"
                   >
                     <div className="w-12 h-12 rounded-full bg-emerald-900/5 group-hover:bg-emerald-900/10 flex items-center justify-center transition-colors">
                       <Plus size={24} />
                     </div>
                     <span className="font-bold">List New Item</span>
                   </button>

                   {/* Existing Items */}
                   {myItems.map(item => (
                     <div key={item._id} className="relative group">
                        <ItemCard item={item} onClick={() => navigate(`/items/${item._id}`)} />
                        {item.status !== 'available' && (
                          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-[24px] flex items-center justify-center z-20">
                             <div className="bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-900 shadow-md">
                               {item.status.replace('_', ' ')}
                             </div>
                          </div>
                        )}
                     </div>
                   ))}
                </motion.div>
              )}

              {/* INCOMING TAB */}
              {activeTab === 'incoming' && (
                 <motion.div 
                    key="incoming" 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                 >
                    {incomingTrades.length === 0 ? (
                       <div className="col-span-full text-center py-20 text-emerald-900/40">No incoming offers yet.</div>
                    ) : (
                       incomingTrades.map(trade => (
                          <TradeRequestCard key={trade._id} trade={trade} isIncoming={true} onRefresh={fetchData} />
                       ))
                    )}
                 </motion.div>
              )}

              {/* SENT TAB */}
              {activeTab === 'sent' && (
                 <motion.div 
                    key="sent" 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                 >
                    {sentTrades.length === 0 ? (
                       <div className="col-span-full text-center py-20 text-emerald-900/40">You haven't made any offers.</div>
                    ) : (
                       sentTrades.map(trade => (
                          <TradeRequestCard key={trade._id} trade={trade} isIncoming={false} onRefresh={fetchData} />
                       ))
                    )}
                 </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;