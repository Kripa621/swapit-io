import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Tag, ArrowUpRight } from 'lucide-react';
import { THEME, SPRING_CONFIG } from '../../components/layout/PageWrapper';

const ItemCard = ({ item, onClick }) => {
  return (
    <motion.div
      layoutId={`item-${item._id}`}
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING_CONFIG}
      className={`group relative flex flex-col overflow-hidden rounded-[24px] ${THEME.glass} cursor-pointer`}
    >
      {/* 1. Image Area with Overlay */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {item.images?.length > 0 ? (
          <img 
            src={item.images[0]} 
            alt={item.title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-emerald-900/10 flex items-center justify-center text-emerald-900/40 font-bold">
            No Image
          </div>
        )}

        {/* Condition Badge */}
        <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-900 shadow-sm">
          {item.condition}
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-emerald-950 leading-tight line-clamp-1">{item.title}</h3>
          <span className="font-black text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded-lg text-sm">
            ₹{item.estimatedValue}
          </span>
        </div>

        <p className="text-emerald-900/60 text-sm line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Footer Info */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-emerald-900/5">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-800/70">
            <div className="w-5 h-5 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold uppercase text-[10px]">
              {item.ownerId?.username?.[0] || 'U'}
            </div>
            {item.ownerId?.username || 'Unknown'}
          </div>
          
          <div className="text-emerald-500 group-hover:translate-x-1 transition-transform">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;