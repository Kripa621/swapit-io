import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Check, X, Clock, MessageCircle, AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { THEME } from '../layout/PageWrapper';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const TradeRequestCard = ({ trade, isIncoming, onRefresh }) => {
  const navigate = useNavigate();

  // Handle Actions (Only Reject is handled directly from the card now)
  const handleAction = async (action) => {
    try {
      if (action === 'reject') {
        await api.put(`/trades/${trade._id}/reject`);
        toast.error("Trade Rejected");
        onRefresh();
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  // Status Badge Helper
  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'disputed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <motion.div 
      layout
      className={`p-5 rounded-[24px] ${THEME.glass} flex flex-col gap-4 relative overflow-hidden`}
    >
      {/* Header: User & Status */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-900 text-[#F7F5E6] flex items-center justify-center font-bold text-xs">
            {isIncoming ? trade.requester?.username?.[0] : trade.receiver?.username?.[0]}
          </div>
          <div className="text-sm">
            <span className="block text-[10px] uppercase font-bold text-emerald-900/50">
              {isIncoming ? 'Request From' : 'Sent To'}
            </span>
            <span className="font-bold text-emerald-950">
              {isIncoming ? trade.requester?.username : trade.receiver?.username}
            </span>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(trade.status)}`}>
          {trade.status}
        </div>
      </div>

      {/* Trade Content: Items Swap */}
      <div className="flex items-center gap-2 text-sm">
        {/* Left Side (Offered) */}
        <div className="flex-1 bg-white/40 p-3 rounded-xl">
           <div className="text-[10px] uppercase font-bold text-emerald-900/50 mb-2">They Offer</div>
           <div className="flex flex-col gap-1">
             {trade.offeredItems.map(item => (
                <div key={item._id} className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden">
                      {item.images?.[0] && <img src={item.images[0]} className="w-full h-full object-cover" />}
                   </div>
                   <span className="font-medium text-emerald-900 truncate">{item.title}</span>
                </div>
             ))}
           </div>
        </div>

        <ArrowRightLeft size={16} className="text-emerald-900/40 shrink-0" />

        {/* Right Side (Requested) */}
        <div className="flex-1 bg-white/40 p-3 rounded-xl">
           <div className="text-[10px] uppercase font-bold text-emerald-900/50 mb-2">For Your</div>
           <div className="flex flex-col gap-1">
             {trade.requestedItems.map(item => (
                <div key={item._id} className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden">
                      {item.images?.[0] && <img src={item.images[0]} className="w-full h-full object-cover" />}
                   </div>
                   <span className="font-medium text-emerald-900 truncate">{item.title}</span>
                </div>
             ))}
           </div>
        </div>
      </div>

      {/* Footer: Actions */}
      <div className="mt-2 flex gap-3">
        {/* If trade is pending, BOTH users can enter the Trade Room to negotiate and lock terms */}
        {trade.status === 'pending' && (
          <>
            <button 
              onClick={() => navigate(`/trades/${trade._id}`)}
              className="flex-1 py-2 bg-emerald-900 text-[#F7F5E6] rounded-xl font-bold text-sm shadow-md hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} /> Open Trade Room
            </button>
            
            {/* Only the receiver can reject from the dashboard */}
            {isIncoming && (
              <button 
                onClick={() => handleAction('reject')}
                className="px-4 py-2 bg-white/60 text-red-700 rounded-xl font-bold text-sm border border-red-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <X size={16} /> Reject
              </button>
            )}
          </>
        )}

        {/* If trade is Active (Accepted) or Disputed, Show Room Button */}
        {['accepted', 'disputed'].includes(trade.status) && (
           <button 
             onClick={() => navigate(`/trades/${trade._id}`)}
             className={`w-full py-2 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 ${trade.status === 'disputed' ? 'bg-orange-600 hover:bg-orange-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
           >
             {trade.status === 'disputed' ? <AlertOctagon size={16} /> : <MessageCircle size={16} />} 
             Enter Trade Room
           </button>
        )}
        
        {/* Completed / Rejected States */}
        {trade.status === 'completed' && (
           <div className="w-full py-2 text-center text-xs font-bold text-emerald-900/60 flex items-center justify-center gap-1">
             <Check size={14} /> Swap Successful
           </div>
        )}

        {trade.status === 'rejected' && (
           <div className="w-full py-2 text-center text-xs font-bold text-red-900/60 flex items-center justify-center gap-1">
             <X size={14} /> Swap Cancelled
           </div>
        )}
      </div>
    </motion.div>
  );
};

export default TradeRequestCard;