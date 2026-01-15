import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw } from 'lucide-react';
import { THEME } from '../layout/PageWrapper';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const ChatBox = ({ tradeId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // 1. Fetch Messages
  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${tradeId}`);
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error("Chat error", error);
    }
  };

  // 2. Poll for new messages every 3 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [tradeId]);

  // 3. Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Optimistic Update (Show immediately)
      const tempMsg = {
        _id: Date.now(),
        text: newMessage,
        sender: { _id: user._id, username: user.username },
        createdAt: new Date().toISOString(),
        pending: true
      };
      setMessages([...messages, tempMsg]);
      setNewMessage('');

      await api.post('/messages', {
        tradeId,
        text: tempMsg.text
      });
      
      fetchMessages(); // Sync with server
    } catch (error) {
      toast.error("Message failed to send");
    }
  };

  return (
    <div className={`flex flex-col h-[600px] ${THEME.glass} rounded-[32px] overflow-hidden`}>
      {/* Header */}
      <div className="p-4 bg-emerald-900/5 border-b border-emerald-900/10 flex justify-between items-center">
        <h3 className="font-bold text-emerald-900 flex items-center gap-2">
          Secure Channel <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
        </h3>
        <button onClick={fetchMessages} className="text-emerald-900/40 hover:text-emerald-900 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/30">
        {loading ? (
           <div className="text-center text-xs text-gray-400 mt-10">Decrypting messages...</div>
        ) : messages.length === 0 ? (
           <div className="text-center text-gray-400 mt-20 text-sm">
             Start the negotiation.<br/>Say hello!
           </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender._id === user._id;
            return (
              <motion.div
                key={msg._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ${
                  isMe 
                    ? 'bg-emerald-900 text-[#F7F5E6] rounded-br-none' 
                    : 'bg-white text-emerald-900 rounded-bl-none'
                }`}>
                  <div className="text-[10px] opacity-50 mb-1">
                    {isMe ? 'You' : msg.sender.username}
                  </div>
                  {msg.text}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white/60 border-t border-emerald-900/10">
        <div className="relative">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full bg-white rounded-xl py-3 pl-4 pr-12 outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-900 placeholder:text-emerald-900/30 font-medium shadow-sm"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-900 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:bg-gray-400 transition-all hover:scale-105"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;