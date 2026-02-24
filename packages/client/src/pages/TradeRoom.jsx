import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle, AlertTriangle, ArrowLeft, Lock, AlertOctagon } from 'lucide-react';
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

  const fetchTrade = async () => {
    try {
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

  // ACTION 1: Lock Terms (Change #6)
  const handleLockTerms = async () => {
    try {
      const { data } = await api.put(`/trades/${id}/lock`);
      toast.success(data.message);
      if(data.paymentLink) {
        toast("Simulated Razorpay Link Generated!", { icon: '🔗' });
      }
      fetchTrade();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to lock terms");
    }
  };

  // ACTION 2: Accept Trade / Pay Escrow
  const handleAccept = async () => {
    try {
      const { data } = await api.put(`/trades/${id}/accept`);
      toast.success("Escrow Secured via Simulated Payment!");
      fetchTrade();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept");
    }
  };

  // ACTION 3: Complete Trade (Meetup Success)
  const handleComplete = async () => {
    if (!window.confirm("Have you successfully received your items? This notifies the admin to release escrow.")) return;
    try {
      const { data } = await api.put(`/trades/${id}/complete`);
      toast.success("Swap Successful!");
      if(data.creditStatus === "pending_review") {
        toast("High-value trade flagged for admin reward review.", { icon: '🛡️' });
      }
      fetchTrade();
    } catch (error) {
      toast.error(error.response?.data?.message || "Completion failed");
    }
  };

  // ACTION 4: Raise Dispute (Change #4)
  const handleDispute = async () => {
    if (!window.confirm("Are you sure you want to raise a dispute? An admin will review the chat logs.")) return;
    try {
      // NOTE: Make sure you add this simple one-liner route in your backend tradeRoutes/tradeController if you haven't yet!
      await api.put(`/trades/${id}/dispute`); 
      toast.error("Dispute Raised. Admin notified.");
      fetchTrade();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to raise issue");
    }
  };

  if (loading) return <div className="text-center mt-20 text-emerald-900 font-bold">Loading Secure Room...</div>;
  if (!trade) return null;

  const isLocked = trade.termsLocked;
  const isAccepted = trade.status === 'accepted';
  const isCompleted = trade.status === 'completed';
  const isDisputed = trade.status === 'disputed';

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
              {isDisputed && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full border border-red-200">DISPUTED</span>}
            </h1>
            <p className="text-emerald-800/60 font-medium text-sm">
              ID: {trade._id} • Escrow Held: <span className="font-bold text-emerald-900">₹{trade.escrowAmount || 0}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Trade Summary & Actions */}
          <div className="space-y-6">
            
            {/* Dynamic Action Card based on State Machine */}
            <div className={`p-6 rounded-[24px] ${isCompleted ? 'bg-blue-50 border-blue-100' : isDisputed ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'} border shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                {isCompleted ? <CheckCircle className="text-blue-600" /> : isDisputed ? <AlertOctagon className="text-red-600" /> : <ShieldCheck className="text-orange-600" />}
                <h3 className={`font-bold ${isCompleted ? 'text-blue-900' : isDisputed ? 'text-red-900' : 'text-orange-900'}`}>
                  {isCompleted ? 'Trade Finalized' : isDisputed ? 'Under Admin Review' : 'Action Required'}
                </h3>
              </div>
              
              <p className="text-sm opacity-80 mb-6 leading-relaxed">
                {isCompleted && "Ownership transferred. Admin will process escrow refund shortly."}
                {isDisputed && "An admin is reviewing the chat logs and receipt evidence to resolve this escrow conflict."}
                {trade.status === 'pending' && !isLocked && "Discuss terms in chat. Once agreed, click 'Lock Terms' to generate the secure payment link."}
                {trade.status === 'pending' && isLocked && "Terms locked! Please pay the 20% escrow deposit to secure the items and schedule the meetup."}
                {isAccepted && "Escrow secured. Meet with the user. Only click 'Complete' after you physically receive the items."}
              </p>

              <div className="space-y-3">
                {trade.status === 'pending' && !isLocked && (
                  <button onClick={handleLockTerms} className="w-full py-3 bg-emerald-900 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                    <Lock size={18}/> Lock Terms
                  </button>
                )}

                {trade.status === 'pending' && isLocked && (
                  <button onClick={handleAccept} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">
                    Pay Escrow (Simulated Razorpay)
                  </button>
                )}

                {isAccepted && (
                  <>
                    <button onClick={handleComplete} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg">
                      Confirm Meetup Success
                    </button>
                    <button onClick={handleDispute} className="w-full py-3 bg-red-100 text-red-700 rounded-xl font-bold shadow-sm border border-red-200">
                      Raise Issue / Dispute
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Items Summary */}
            <div className={`p-6 rounded-[24px] ${THEME.glass}`}>
              <h4 className="text-xs font-bold uppercase text-emerald-900/40 mb-4">Trade Summary</h4>
              
              <div className="mb-6">
                <div className="text-xs font-bold text-emerald-900 mb-2">They Offered</div>
                <div className="space-y-2">
                  {trade.offeredItems.map(item => (
                    <div key={item._id} className="flex gap-3 items-center bg-white/40 p-2 rounded-xl">
                      <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                      <div>
                        <div className="text-sm font-bold text-emerald-900">{item.title}</div>
                        <div className="text-xs text-emerald-600">₹{item.manualPrice}</div> {/* CHANGED to manualPrice */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-emerald-900 mb-2">You Give</div>
                <div className="space-y-2">
                  {trade.requestedItems.map(item => (
                    <div key={item._id} className="flex gap-3 items-center bg-white/40 p-2 rounded-xl">
                      <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                      <div>
                        <div className="text-sm font-bold text-emerald-900">{item.title}</div>
                        <div className="text-xs text-emerald-600">₹{item.manualPrice}</div> {/* CHANGED to manualPrice */}
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