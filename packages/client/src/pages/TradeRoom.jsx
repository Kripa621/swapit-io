import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import PageWrapper, { THEME } from '../components/layout/PageWrapper';
import ChatBox from '../components/trades/ChatBox';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const TradeRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Trade Details
  const fetchTrade = async () => {
    try {
      // We reuse the single trade fetch logic by filtering from all trades
      // Ideally backend should have GET /trades/:id but we can use GET /trades for now
      // Or you can quickly add GET /trades/:id to backend if you prefer.
      // For now let's assume we can fetch it.
      
      // Since your backend code in previous steps didn't explicitly have GET /trades/:id,
      // let's use the 'getMyTrades' endpoint and find it client-side for simplicity
      // (Optimally you should add the endpoint to backend, but this works for demo)
      const { data } = await api.get('/trades');
      const foundTrade = data.find(t => t._id === id);
      
      if (foundTrade) {
        setTrade(foundTrade);
      } else {
        toast.error("Trade not found");
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Failed to load trade");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrade();
  }, [id]);

  // Complete Trade Action
  const handleComplete = async () => {
    if (!window.confirm("Are you sure you have received the items? This releases the escrow.")) return;

    try {
      const { data } = await api.put(`/trades/${id}/complete`);
      toast.success("Trade Completed Successfully!");
      toast(data.message, { icon: '🎉' });
      fetchTrade(); // Refresh to show completed status
    } catch (error) {
      toast.error(error.response?.data?.message || "Completion failed");
    }
  };

  if (loading) return <div className="text-center mt-20">Loading Secure Room...</div>;
  if (!trade) return null;

  const isCompleted = trade.status === 'completed';

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors">
            <ArrowLeft size={20} className="text-emerald-900" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-2">
              Trade Room 
              {isCompleted && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200">COMPLETED</span>}
            </h1>
            <p className="text-emerald-800/60 font-medium text-sm">
              ID: {trade._id} • Escrow Held: <span className="font-bold text-emerald-900">₹{trade.escrowAmount}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Trade Summary */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <div className={`p-6 rounded-[24px] ${isCompleted ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'} border shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                {isCompleted ? <CheckCircle className="text-blue-600" /> : <ShieldCheck className="text-orange-600" />}
                <h3 className={`font-bold ${isCompleted ? 'text-blue-900' : 'text-orange-900'}`}>
                  {isCompleted ? 'Trade Finalized' : 'Action Required'}
                </h3>
              </div>
              
              <p className="text-sm opacity-80 mb-6 leading-relaxed">
                {isCompleted 
                  ? "Funds have been released and ownership transferred. Thank you for trading sustainably!" 
                  : "Only click 'Complete' after you have physically received the items. This action is irreversible."}
              </p>

              {!isCompleted && (
                <button 
                  onClick={handleComplete}
                  className="w-full py-3 bg-emerald-900 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-800 transition-transform active:scale-95"
                >
                  Confirm Receipt & Complete
                </button>
              )}
            </div>

            {/* Items Summary */}
            <div className={`p-6 rounded-[24px] ${THEME.glass}`}>
              <h4 className="text-xs font-bold uppercase text-emerald-900/40 mb-4">Trade Summary</h4>
              
              {/* Their Items */}
              <div className="mb-6">
                <div className="text-xs font-bold text-emerald-900 mb-2">They Offered</div>
                <div className="space-y-2">
                  {trade.offeredItems.map(item => (
                    <div key={item._id} className="flex gap-3 items-center bg-white/40 p-2 rounded-xl">
                      <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                      <div>
                        <div className="text-sm font-bold text-emerald-900">{item.title}</div>
                        <div className="text-xs text-emerald-600">₹{item.estimatedValue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Items */}
              <div>
                <div className="text-xs font-bold text-emerald-900 mb-2">You Give</div>
                <div className="space-y-2">
                  {trade.requestedItems.map(item => (
                    <div key={item._id} className="flex gap-3 items-center bg-white/40 p-2 rounded-xl">
                      <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                      <div>
                        <div className="text-sm font-bold text-emerald-900">{item.title}</div>
                        <div className="text-xs text-emerald-600">₹{item.estimatedValue}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: Chat */}
          <div className="lg:col-span-2">
            <ChatBox tradeId={id} />
          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

export default TradeRoom;