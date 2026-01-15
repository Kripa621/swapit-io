import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, User, RefreshCcw, Tag } from 'lucide-react';
import PageWrapper, { THEME } from '../components/layout/PageWrapper';
import TradeModal from '../components/trades/TradeModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // To check if I am the owner
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`/items/${id}`);
        setItem(data);
      } catch (error) {
        toast.error("Item not found");
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-emerald-900">Loading Treasure...</div>;
  if (!item) return null;

  const isOwner = user?._id === item.ownerId?._id;

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-emerald-900/60 hover:text-emerald-900 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back to Market
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            <motion.div 
              layoutId={`item-${item._id}`}
              className="aspect-[4/3] rounded-[32px] overflow-hidden bg-white shadow-sm border border-white/50 relative"
            >
              {item.images?.length > 0 ? (
                <img src={item.images[activeImage]} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No Image</div>
              )}
            </motion.div>
            
            {/* Thumbnails */}
            {item.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${activeImage === idx ? 'border-emerald-600 opacity-100' : 'border-transparent opacity-60'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Details & Action */}
          <div className="flex flex-col h-full">
            
            {/* Owner Badge */}
            <div className="flex items-center gap-3 mb-6 bg-white/40 w-fit px-4 py-2 rounded-full border border-white/60">
               <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center font-bold text-xs">
                 {item.ownerId?.username?.[0] || 'U'}
               </div>
               <div className="text-sm">
                 <span className="text-emerald-900/50 block text-[10px] uppercase font-bold tracking-wider">Owner</span>
                 <span className="font-bold text-emerald-950">{item.ownerId?.username || 'Unknown'}</span>
               </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-emerald-950 mb-4 leading-tight">{item.title}</h1>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="px-4 py-1.5 bg-emerald-900 text-[#F7F5E6] rounded-full text-sm font-bold shadow-md shadow-emerald-900/10">
                 ₹{item.estimatedValue} Value
              </span>
              <span className="px-4 py-1.5 bg-white/60 text-emerald-900 rounded-full text-sm font-bold border border-white/60">
                 {item.condition}
              </span>
              <span className="px-4 py-1.5 bg-white/60 text-emerald-900 rounded-full text-sm font-bold border border-white/60">
                 {item.category}
              </span>
            </div>

            <div className={`flex-1 p-6 rounded-3xl ${THEME.glass} mb-8`}>
               <h3 className="text-xs font-bold uppercase text-emerald-900/40 mb-3 tracking-wider">Description</h3>
               <p className="text-emerald-900/80 leading-relaxed font-medium">
                 {item.description}
               </p>
            </div>

            {/* ACTION AREA */}
            {isOwner ? (
               <div className="p-4 bg-gray-100 rounded-2xl text-center text-gray-500 font-medium text-sm">
                 This is your item. You cannot trade with yourself.
               </div>
            ) : (
               <div className="space-y-4">
                 <div className="flex items-center gap-3 text-sm text-emerald-800/70 px-2">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <span>Protected by SwapIt Escrow (20% Deposit)</span>
                 </div>
                 <button 
                   onClick={() => setIsTradeModalOpen(true)}
                   className="w-full py-5 bg-emerald-900 text-[#F7F5E6] rounded-3xl font-black text-xl shadow-xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                 >
                   <RefreshCcw size={24} /> Propose Trade
                 </button>
               </div>
            )}
          </div>

        </div>
      </div>

      {/* Trade Modal */}
      <TradeModal 
        isOpen={isTradeModalOpen} 
        onClose={() => setIsTradeModalOpen(false)} 
        targetItem={item}
      />
    </PageWrapper>
  );
};

export default ItemDetails;