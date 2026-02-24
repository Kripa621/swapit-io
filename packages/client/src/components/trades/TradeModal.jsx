import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle } from 'lucide-react';
import { THEME } from '../layout/PageWrapper';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const TradeModal = ({ isOpen, onClose, targetItem }) => {
  const [myItems, setMyItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch My Inventory when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchInventory = async () => {
        try {
          // We added this endpoint in Phase 1
          const { data } = await api.get('/items/myitems'); 
          // Only show available items
          setMyItems(data.filter(i => i.status === 'available'));
        } catch (error) {
          toast.error("Could not load your inventory");
        } finally {
          setLoading(false);
        }
      };
      fetchInventory();
    }
  }, [isOpen]);

  // 2. Toggle Selection
  const toggleItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // 3. Send Trade Request
  const handlePropose = async () => {
    if (selectedItems.length === 0) {
      toast.error("Select at least one item to offer!");
      return;
    }

    try {
      await api.post('/trades', {
        receiver: targetItem.ownerId._id,
        offeredItems: selectedItems,
        requestedItems: [targetItem._id]
      });
      toast.success("Trade Proposal Sent!");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Trade failed");
    }
  };

  // Calculate Values
  const myTotalValue = myItems
    .filter(i => selectedItems.includes(i._id))
    .reduce((sum, i) => sum + i.estimatedValue, 0);

  const valueDiff = targetItem?.estimatedValue - myTotalValue;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className={`w-full max-w-2xl bg-[#FDFCF8] rounded-[32px] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh]`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-900/5">
          <div>
            <h2 className="text-2xl font-black text-emerald-950">Make an Offer</h2>
            <p className="text-sm text-emerald-800/60 font-medium">Trading for: {targetItem?.title}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-red-50 text-emerald-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Inventory List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-xs font-bold uppercase text-emerald-900/40 mb-4">Select items to offer ({myItems.length})</h3>
          
          {loading ? (
             <div className="text-center py-10">Loading your vault...</div>
          ) : myItems.length === 0 ? (
             <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
               <AlertCircle className="mx-auto text-gray-400 mb-2" />
               <p className="text-gray-500">Your vault is empty.</p>
               <p className="text-xs text-gray-400">List items first to trade.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myItems.map(item => {
                const isSelected = selectedItems.includes(item._id);
                return (
                  <div 
                    key={item._id}
                    onClick={() => toggleItem(item._id)}
                    className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all flex gap-3 items-center ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50' 
                        : 'border-transparent bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                       {item.images?.[0] && <img src={item.images[0]} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-emerald-900 line-clamp-1">{item.title}</div>
                      <div className="text-xs text-emerald-600 font-medium">₹{item.estimatedValue}</div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-emerald-600 bg-white rounded-full p-1 shadow-sm">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer: Value Calculation */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex justify-between items-center mb-4 text-sm font-medium">
             <span className="text-gray-500">Their Item Value:</span>
             <span className="text-emerald-900">₹{targetItem?.estimatedValue}</span>
          </div>
          <div className="flex justify-between items-center mb-6 text-sm font-bold">
             <span className="text-emerald-700">Your Offer Value:</span>
             <span className="text-emerald-900">₹{myTotalValue}</span>
          </div>

          <button 
            onClick={handlePropose}
            disabled={selectedItems.length === 0}
            className="w-full py-4 bg-emerald-900 text-[#F7F5E6] rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Proposal
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TradeModal;