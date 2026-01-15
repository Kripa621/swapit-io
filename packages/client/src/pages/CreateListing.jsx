import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Tag, FileText, LayoutGrid, Sparkles, ArrowLeft } from 'lucide-react';
import PageWrapper, { THEME, SPRING_CONFIG } from '../components/layout/PageWrapper';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [estimatedValue, setEstimatedValue] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    condition: 'Functional',
    images: [] // Stores actual File objects
  });

  const categories = ["Electronics", "Books", "Educational Materials", "Hardware", "Fashion", "Toys", "Others"];
  const conditions = ["New", "Like New", "Gently Used", "Functional"];

  // 1. Auto-Calculate Value when Category/Condition changes
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const { data } = await api.post('/valuation/estimate', {
          category: formData.category,
          condition: formData.condition
        });
        setEstimatedValue(data.estimatedValue);
      } catch (error) {
        console.error("Valuation failed", error);
      }
    };
    fetchEstimate();
  }, [formData.category, formData.condition]);

  // 2. Handle Image Selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      toast.error("Max 5 images allowed.");
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    const newPreviews = [...previewImages];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setFormData({ ...formData, images: newImages });
    setPreviewImages(newPreviews);
  };

  // 3. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('condition', formData.condition);
    
    // Append each file
    formData.images.forEach((image) => {
      data.append('images', image);
    });

    try {
      await api.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Item listed successfully!");
      navigate('/marketplace');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            <ArrowLeft size={20} className="text-emerald-900" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-emerald-950">List an Item</h1>
            <p className="text-emerald-800/60 font-medium">Add a new treasure to the forest.</p>
          </div>
        </div>

        <div className={`p-6 md:p-8 rounded-[32px] ${THEME.glass} relative overflow-hidden`}>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Basic Info */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Title</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40" size={18} />
                  <input 
                    required
                    maxLength="50"
                    placeholder="e.g. Vintage Camera Lens"
                    className="w-full bg-white/40 border border-white/60 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-900 placeholder:text-emerald-900/30 font-medium transition-all"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-emerald-900/40" size={18} />
                  <textarea 
                    required
                    rows="4"
                    placeholder="Describe the condition, history, and why you are swapping it..."
                    className="w-full bg-white/40 border border-white/60 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-900 placeholder:text-emerald-900/30 font-medium transition-all resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* 2. Details & Valuation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Category</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40" size={18} />
                  <select 
                    className="w-full bg-white/40 border border-white/60 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-900 font-medium appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Condition</label>
                <div className="relative">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40" size={18} />
                  <select 
                    className="w-full bg-white/40 border border-white/60 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-900 font-medium appearance-none cursor-pointer"
                    value={formData.condition}
                    onChange={e => setFormData({...formData, condition: e.target.value})}
                  >
                    {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Valuation Display */}
            <motion.div 
              layout
              className="bg-emerald-900/5 border border-emerald-900/10 rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold uppercase text-emerald-800/60">AI Estimated Value</div>
                <div className="text-sm text-emerald-800">Based on market data</div>
              </div>
              <div className="text-2xl font-black text-emerald-900">
                ₹{estimatedValue || '---'}
              </div>
            </motion.div>

            {/* 3. Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Photos (Max 5)</label>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {/* Upload Button */}
                <label className="aspect-square rounded-2xl border-2 border-dashed border-emerald-900/20 bg-emerald-900/5 hover:bg-emerald-900/10 cursor-pointer flex flex-col items-center justify-center text-emerald-900/50 hover:text-emerald-900 transition-all">
                  <Upload size={24} />
                  <span className="text-[10px] font-bold mt-1">ADD</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

                {/* Previews */}
                <AnimatePresence mode='popLayout'>
                  {previewImages.map((src, idx) => (
                    <motion.div 
                      key={src}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm"
                    >
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <X size={20} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-4 bg-emerald-900 text-[#F7F5E6] rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Listing Item...</>
              ) : (
                <>List Item <Sparkles size={18} /></>
              )}
            </motion.button>

          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CreateListing;