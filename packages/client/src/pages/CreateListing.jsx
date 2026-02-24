import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Tag, FileText, LayoutGrid, Sparkles, ArrowLeft, IndianRupee, Receipt } from 'lucide-react';
import PageWrapper, { THEME } from '../components/layout/PageWrapper';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // States for previews
  const [previewImages, setPreviewImages] = useState([]);
  const [receiptPreview, setReceiptPreview] = useState(null); // Preview for the mandatory bill/invoice

  // EXACT variable names matching our Phase 2 backend upgrades
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    manualPrice: '', // Replaced originalPrice
    category: 'Electronics',
    condition: 'Functional',
    images: [], 
    receiptImage: null // New required field
  });

  const categories = ["Electronics", "Books", "Educational Materials", "Hardware", "Fashion", "Toys", "Others"];
  const conditions = ["New", "Like New", "Gently Used", "Functional"];

  // Handle Receipt Upload (Single File)
  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, receiptImage: file });
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const removeReceipt = () => {
    setFormData({ ...formData, receiptImage: null });
    setReceiptPreview(null);
  };

  // Handle Item Images Upload (Multiple Files)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 5) {
      toast.error("Max 5 images allowed.");
      return;
    }
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

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Enforce receipt requirement
    if (!formData.receiptImage) {
      toast.error("You must upload an original bill or invoice for admin verification.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('manualPrice', formData.manualPrice);
    data.append('category', formData.category);
    data.append('condition', formData.condition);
    
    // Append the mandatory receipt for verification
    data.append('receiptImage', formData.receiptImage);

    formData.images.forEach((image) => {
      data.append('images', image);
    });

    try {
      await api.post('/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // The item is now "pending", not live on the marketplace
      toast.success("Listing submitted! Pending admin approval.");
      navigate('/dashboard'); // Navigate to dashboard so they can see their pending items
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit listing");
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
            <p className="text-emerald-800/60 font-medium">Add a new treasure. (Subject to admin review)</p>
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

            {/* 2. Details */}
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

              {/* MANUAL PRICE */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Desired Value (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40" size={18} />
                  <input 
                    type="number"
                    required
                    min="0"
                    placeholder="Set your own price"
                    className="w-full bg-white/40 border border-white/60 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-900 placeholder:text-emerald-900/30 font-medium transition-all"
                    value={formData.manualPrice}
                    onChange={e => setFormData({...formData, manualPrice: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-emerald-900/40 ml-2">Warning: Items manually priced over ₹10,000 will be heavily scrutinized for credit point farming.</p>
              </div>
            </div>

            {/* 3. Mandatory Receipt Upload */}
            <div className="space-y-2 bg-emerald-900/5 p-4 rounded-2xl border border-emerald-900/10">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 ml-2 flex items-center gap-2">
                <Receipt size={16} /> Original Bill / Invoice (Required)
              </label>
              <p className="text-[10px] text-emerald-900/60 ml-2 mb-2">Our Admins will review this to verify authenticity before listing.</p>
              
              {!receiptPreview ? (
                <label className="w-full h-24 rounded-2xl border-2 border-dashed border-emerald-900/30 bg-white/50 hover:bg-white/80 cursor-pointer flex flex-col items-center justify-center text-emerald-900/50 hover:text-emerald-900 transition-all">
                  <Upload size={20} className="mb-1" />
                  <span className="text-[10px] font-bold mt-1">UPLOAD RECEIPT</span>
                  <input type="file" required accept="image/*" className="hidden" onChange={handleReceiptChange} />
                </label>
              ) : (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden group shadow-sm border-2 border-emerald-500/50">
                  <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeReceipt}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-0 w-full bg-emerald-500/90 text-white text-[10px] font-bold text-center py-1">
                    Receipt Attached
                  </div>
                </div>
              )}
            </div>

            {/* 4. Item Photos Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Item Photos (Max 5)</label>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                <label className="aspect-square rounded-2xl border-2 border-dashed border-emerald-900/20 bg-emerald-900/5 hover:bg-emerald-900/10 cursor-pointer flex flex-col items-center justify-center text-emerald-900/50 hover:text-emerald-900 transition-all">
                  <Upload size={24} />
                  <span className="text-[10px] font-bold mt-1">ADD</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

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
                <>Submitting for Review...</>
              ) : (
                <>Submit for Review <Sparkles size={18} /></>
              )}
            </motion.button>

          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CreateListing;