import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Save, LogOut, Settings, Camera, Edit3 } from 'lucide-react';
import PageWrapper, { THEME } from '../components/layout/PageWrapper';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: ''
  });

  // Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setFormData({
          username: data.username,
          email: data.email,
          bio: data.bio || "Forest explorer trading treasures.",
          avatar: data.avatar || ""
        });
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success("Logged out safely");
  };

  // Avatar Selection (Mock for now, sets a random seed)
  const randomizeAvatar = () => {
    const seeds = ['Felix', 'Aneka', 'Zoe', 'Bear', 'Leo'];
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)] + Math.random();
    setFormData({ ...formData, avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${randomSeed}` });
  };

  if (loading) return null;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
              <Settings className="text-emerald-900" size={32} />
              Settings & Profile
            </h1>
            <p className="text-emerald-800/60 font-medium ml-1">Manage your identity in the forest.</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className={`p-8 rounded-[32px] ${THEME.glass} relative overflow-hidden`}>
          
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-emerald-100 border-4 border-white shadow-lg overflow-hidden relative">
                 <img 
                   src={formData.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${formData.username}`} 
                   alt="Avatar" 
                   className="w-full h-full object-cover"
                 />
              </div>
              {isEditing && (
                <button 
                  onClick={randomizeAvatar}
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-emerald-900 text-white rounded-full shadow-md hover:bg-emerald-800 transition-transform hover:scale-110"
                >
                  <Camera size={16} />
                </button>
              )}
            </div>
            
            {!isEditing && (
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-black text-emerald-950">{formData.username}</h2>
                <p className="text-emerald-800/60 font-medium">{formData.email}</p>
                <div className="mt-4 px-4 py-2 bg-white/40 rounded-xl text-emerald-900 italic text-sm">
                  "{formData.bio}"
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-emerald-900">Personal Details</h3>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold uppercase tracking-wider text-emerald-900/50 hover:text-emerald-900 flex items-center gap-1"
              >
                {isEditing ? 'Cancel Editing' : <><Edit3 size={14} /> Edit Profile</>}
              </button>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Username</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40" size={18} />
                      <input 
                        className="w-full bg-white/40 border border-white/60 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-900 font-medium"
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Bio</label>
                    <textarea 
                      rows="2"
                      className="w-full bg-white/40 border border-white/60 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-900 font-medium resize-none"
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      maxLength={150}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-emerald-900 text-[#F7F5E6] rounded-xl font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Save Changes
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

        </div>
      </div>
    </PageWrapper>
  );
};

export default Profile;