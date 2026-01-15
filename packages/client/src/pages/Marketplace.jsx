import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageWrapper, { THEME } from '../components/layout/PageWrapper';
import ItemCard from '../components/items/ItemCard';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Marketplace = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories matching your Backend Valuation Service
  const categories = ["All", "Electronics", "Books", "Fashion", "Toys", "Hardware", "Others"];

  // 1. Fetch Items from Backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await api.get('/items');
        setItems(data);
      } catch (error) {
        toast.error("Could not load the forest market.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // 2. Filter Logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-emerald-950 tracking-tight mb-2">
              Forest Market
            </h1>
            <p className="text-emerald-800/60 font-medium text-lg">
              Discover {items.length} hidden treasures nearby.
            </p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
             <button 
                onClick={() => navigate('/create-listing')}
                className="bg-emerald-900 text-[#F7F5E6] px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-900/20 hover:scale-105 transition-transform"
             >
                + List Item
             </button>
          </div>
        </div>

        {/* --- Search & Filter Bar --- */}
        <div className={`p-4 rounded-[24px] ${THEME.glass} mb-10 flex flex-col md:flex-row gap-4 items-center`}>
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40" size={20} />
            <input 
              type="text"
              placeholder="Search for 'Gaming Console'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/40 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-900 placeholder:text-emerald-900/30 font-medium"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-emerald-900 text-[#F7F5E6] shadow-md' 
                    : 'bg-white/40 text-emerald-900/70 hover:bg-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- The Grid --- */}
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="w-10 h-10 border-4 border-emerald-900/20 border-t-emerald-900 rounded-full animate-spin" />
           </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <ItemCard 
                  key={item._id} 
                  item={item} 
                  onClick={() => navigate(`/items/${item._id}`)} 
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-emerald-900/40 font-medium">
                No treasures found in this clearing.
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Marketplace;