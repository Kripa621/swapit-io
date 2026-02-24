import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Receipt, AlertOctagon, IndianRupee, CheckCircle, XCircle, X, MessageSquare } from 'lucide-react';
import PageWrapper, { THEME } from '../components/layout/PageWrapper';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('approvals');
  const [loading, setLoading] = useState(true);

  // States for our 4 Admin Queues
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [pendingCredits, setPendingCredits] = useState([]);
  const [disputes, setDisputes] = useState([]);

  // Chat Log Modal States
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatLogs, setChatLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState(null);

  // Fetch all admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [itemsRes, refundsRes, creditsRes, disputesRes] = await Promise.all([
        api.get('/admin/items/pending'),
        api.get('/admin/refunds/pending'),
        api.get('/admin/credits/pending'),
        api.get('/admin/disputes')
      ]);
      setPendingItems(itemsRes.data);
      setPendingRefunds(refundsRes.data);
      setPendingCredits(creditsRes.data);
      setDisputes(disputesRes.data);
    } catch (error) {
      toast.error("Not authorized or failed to fetch admin data.");
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error("Access Denied. Admins only.");
      navigate('/dashboard');
    } else if (user) {
      fetchAdminData();
    }
  }, [user, navigate]);

  // Actions
  const handleItemReview = async (id, status) => {
    try {
      await api.put(`/admin/items/${id}/review`, { status });
      toast.success(`Item ${status} successfully`);
      fetchAdminData();
    } catch (error) { toast.error("Failed to review item"); }
  };

  const handleManualRefund = async (id) => {
    if(!window.confirm("Did you process the refund in the Razorpay Test Dashboard?")) return;
    try {
      await api.put(`/admin/refunds/${id}/confirm`);
      toast.success("Database Escrow Hold Released");
      fetchAdminData();
    } catch (error) { toast.error("Failed to release refund"); }
  };

  const handleCreditApproval = async (id) => {
    try {
      await api.put(`/admin/credits/${id}/approve`);
      toast.success("Credits Awarded to users");
      fetchAdminData();
    } catch (error) { toast.error("Failed to approve credits"); }
  };

  // Fetch Chat Logs for Dispute
  const handleViewLogs = async (tradeId) => {
    setSelectedTradeId(tradeId);
    setIsChatModalOpen(true);
    setLoadingLogs(true);
    try {
      const { data } = await api.get(`/admin/disputes/${tradeId}/logs`);
      setChatLogs(data);
    } catch (error) {
      toast.error("Failed to load chat logs");
    } finally {
      setLoadingLogs(false);
    }
  };
  const handleResolveDispute = async (id) => {
    if(!window.confirm("Did you issue the refunds via Razorpay? This will cancel the trade and release the items back to the marketplace.")) return;
    try {
      await api.put(`/admin/disputes/${id}/resolve`);
      toast.success("Dispute Resolved & Trade Cancelled!");
      fetchAdminData();
    } catch (error) { 
      toast.error("Failed to resolve dispute"); 
    }
  };

  const tabs = [
    { id: 'approvals', label: 'Item Approvals', count: pendingItems.length, icon: <Receipt size={16}/> },
    { id: 'refunds', label: 'Razorpay Refunds', count: pendingRefunds.length, icon: <IndianRupee size={16}/> },
    { id: 'credits', label: 'Anti-Gaming Review', count: pendingCredits.length, icon: <ShieldCheck size={16}/> },
    { id: 'disputes', label: 'Disputes', count: disputes.length, icon: <AlertOctagon size={16}/> },
  ];

  if (loading) return <div className="text-center mt-20 font-bold text-emerald-900">Loading Admin Secure Vault...</div>;

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={32} />
            Admin Security Dashboard
          </h1>
          <p className="text-emerald-800/60 font-medium mt-1">Resolve disputes, process manual refunds, and moderate listings.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-900 text-white shadow-lg' 
                  : 'bg-white/40 text-emerald-900/60 hover:bg-white/60'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={`p-6 rounded-[32px] ${THEME.glass} min-h-[400px]`}>
          <AnimatePresence mode="wait">
            
            {/* 1. ITEM APPROVALS */}
            {activeTab === 'approvals' && (
              <motion.div key="approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {pendingItems.length === 0 ? <p className="text-emerald-900/50">No items pending approval.</p> : pendingItems.map(item => (
                  <div key={item._id} className="bg-white/50 p-4 rounded-2xl flex flex-col md:flex-row gap-6 items-center border border-white/60">
                    <img src={item.receiptImage} alt="Receipt" className="w-32 h-32 object-cover rounded-xl border-2 border-dashed border-emerald-900/30" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-emerald-900">{item.title}</h3>
                      <p className="text-sm text-emerald-900/70 mt-1">User set price: <span className="font-bold">₹{item.manualPrice}</span></p>
                      <p className="text-xs text-emerald-900/50 mt-1">Please verify the receipt image matches the item description and value.</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleItemReview(item._id, 'approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl flex items-center gap-2 font-bold"><CheckCircle size={18}/> Approve</button>
                      <button onClick={() => handleItemReview(item._id, 'rejected')} className="bg-red-100 hover:bg-red-200 text-red-700 p-3 rounded-xl flex items-center gap-2 font-bold"><XCircle size={18}/> Reject</button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* 2. MANUAL REFUNDS */}
            {activeTab === 'refunds' && (
              <motion.div key="refunds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {pendingRefunds.length === 0 ? <p className="text-emerald-900/50">No pending refunds.</p> : pendingRefunds.map(trade => (
                  <div key={trade._id} className="bg-orange-50 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center border border-orange-200">
                    <div>
                      <h3 className="font-bold text-orange-900">Trade #{trade._id.substring(0,8)}</h3>
                      <p className="text-sm text-orange-800/70 mt-1">Escrow to refund: <span className="font-bold text-lg">₹{trade.escrowAmount}</span></p>
                    </div>
                    <button onClick={() => handleManualRefund(trade._id)} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold shadow-md mt-4 md:mt-0">
                      Confirm Razorpay Refund
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {/* 3. ANTI-GAMING */}
            {activeTab === 'credits' && (
              <motion.div key="credits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {pendingCredits.length === 0 ? <p className="text-emerald-900/50">No pending credit rewards.</p> : pendingCredits.map(trade => (
                  <div key={trade._id} className="bg-blue-50 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center border border-blue-200">
                    <div>
                      <h3 className="font-bold text-blue-900">High-Value Trade Flagged</h3>
                      <p className="text-sm text-blue-800/70 mt-1">Users swapped items valued over ₹10,000. Verify this isn't a fake listing to farm points.</p>
                    </div>
                    <button onClick={() => handleCreditApproval(trade._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md mt-4 md:mt-0">
                      Approve 50 Credits
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {/* 4. DISPUTES */}
            {activeTab === 'disputes' && (
              <motion.div key="disputes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {disputes.length === 0 ? <p className="text-emerald-900/50">No active disputes. The forest is peaceful.</p> : disputes.map(trade => (
                  <div key={trade._id} className="bg-red-50 p-4 rounded-2xl border border-red-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900">Meetup Failed - Trade #{trade._id.substring(0,8)}</h3>
                      <p className="text-sm text-red-800/70 mt-1">Review the chat logs, issue Razorpay refunds as necessary, and then resolve this ticket.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      <button onClick={() => handleViewLogs(trade._id)} className="bg-white hover:bg-gray-50 text-red-700 px-4 py-3 rounded-xl font-bold shadow-sm border border-red-200 flex items-center justify-center gap-2">
                        <MessageSquare size={18} /> Logs
                      </button>
                      
                      {/* NEW RESOLVE BUTTON */}
                      <button onClick={() => handleResolveDispute(trade._id)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2">
                        <CheckCircle size={18} /> Resolve & Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* CHAT LOGS MODAL */}
      <AnimatePresence>
        {isChatModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              onClick={() => setIsChatModalOpen(false)}
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="relative w-full max-w-2xl bg-[#FDFCF8] rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-4 bg-red-900 text-white flex justify-between items-center shrink-0">
                <h3 className="font-bold flex items-center gap-2">
                  <ShieldCheck size={20} />
                  Official Chat Transcript: Trade #{selectedTradeId?.substring(0,8)}
                </h3>
                <button onClick={() => setIsChatModalOpen(false)} className="hover:text-red-200 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-red-50/50">
                {loadingLogs ? (
                  <div className="text-center text-sm py-10 text-red-900/60 font-medium">Decrypting server logs...</div>
                ) : chatLogs.length === 0 ? (
                  <div className="text-center text-sm py-10 text-red-900/60 font-medium">No messages found for this trade.</div>
                ) : (
                  chatLogs.map(msg => (
                    <div key={msg._id} className="bg-white p-4 rounded-2xl shadow-sm border border-red-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black uppercase text-red-900">{msg.sender.username}</span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className={`text-sm ${msg.text.includes('BLOCKED') ? 'text-red-500 font-bold' : 'text-gray-800'}`}>
                        {msg.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PageWrapper>
  );
};

export default AdminDashboard;