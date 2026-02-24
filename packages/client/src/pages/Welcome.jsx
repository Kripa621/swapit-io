import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Imported useNavigate
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { Lock, ShieldCheck, MessageCircle, Leaf, RefreshCcw, X, ArrowRight, Coins, Scale, TrendingUp } from 'lucide-react';

/**
 * SwapIt.io - Ghibli-Inspired Edition
 * Theme: Lush nature colors, hand-painted gradients, visible paper grain.
 */

// --- Assets & Constants ---

// Enhanced Ghibli Palette
const THEME = {
  paper: "bg-[#F7F5E6]", // Warmer, old paper feel
  moss: "from-[#8A9A5B] to-[#4F6F52]", // Deep mossy greens
  sky: "from-[#A4C3D2] to-[#6B90A7]", // Muted rainy sky
  sunset: "from-[#E6B89C] to-[#C88EA7]", // Soft sunset
  meadow: "from-[#D4E2C7] to-[#A8C686]", // Bright grass
  water: "from-[#B8D8D8] to-[#7A9E9F]", // River colors
  glass: "backdrop-blur-md bg-white/30 border border-white/40 shadow-xl ring-1 ring-white/50",
};

const SPRING_CONFIG = { type: "spring", stiffness: 250, damping: 25, mass: 1 };

// 1️⃣ Global Motion Variants
const FLOAT = {
  animate: { y: [0, -6, 0], rotate: [0, 0.6, 0] },
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
};

const SOFT_WOBBLE = {
  animate: { rotate: [0, 0.8, -0.8, 0] },
  transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
};

const CARD_IDLE = {
  animate: { y: [0, -4, 0] },
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
};

const TAP_PULSE = {
  scale: [1, 0.96, 1.02, 1],
  transition: { duration: 0.4 }
};

// --- Utility Components ---

// 2. Stronger Grain Overlay for "Paper" Texture
const GrainOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] opacity-20 mix-blend-multiply"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden'
    }}
  />
);

// 3. Custom Cursor (Soot Sprite style)
const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 10);
      cursorY.set(e.clientY - 10);
    };
    window.addEventListener('mousemove', moveCursor, { passive: true });
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-5 h-5 rounded-full bg-gray-900/80 pointer-events-none z-[110] blur-[1px]"
      style={{ x: cursorX, y: cursorY, pointerEvents: 'none' }}
      transition={{ type: "spring", damping: 20, stiffness: 400, mass: 0.5 }}
    />
  );
};

// 4. Painted Background (Vibrant & Organic)
const PaintedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#F2F0E4]" style={{ transform: 'translateZ(0)' }}>
    <motion.div
      animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      style={{ willChange: 'transform, opacity' }}
      className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-green-300/30 rounded-full blur-[100px] mix-blend-multiply"
    />
    <motion.div
      animate={{ x: [0, -40, 0], y: [0, 60, 0], scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      style={{ willChange: 'transform, opacity' }}
      className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-blue-300/30 rounded-full blur-[120px] mix-blend-multiply"
    />
    <motion.div
      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      style={{ willChange: 'transform, opacity' }}
      className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-pink-200/40 rounded-full blur-[90px] mix-blend-multiply"
    />
  </div>
);

// --- Card Content Components ---

const ValuationContent = () => {
  const [condition, setCondition] = useState(1);
  const conditions = ["Functional", "Gently Used", "Like New"];
  const prices = ["₹800", "₹1,400", "₹2,000"];
  
  return (
    <div className="flex flex-col h-full justify-between relative z-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/40 p-1.5 rounded-lg text-emerald-800"><Scale size={18} /></div>
            <h3 className="font-bold text-xl text-emerald-900">Fair Value AI</h3>
        </div>
        <p className="text-sm text-emerald-800/70 font-medium">Drag to see price changes.</p>
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
        <motion.div
          className="text-4xl font-black text-emerald-800 mb-4 tabular-nums text-center"
          key={prices[condition]}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {prices[condition]}
        </motion.div>
        
        {/* Slider Track */}
        <div className="relative h-14 bg-emerald-900/10 rounded-full flex items-center px-1">
            <div className="absolute inset-0 flex justify-between px-4 items-center w-full z-0">
                {conditions.map((c, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i <= condition ? 'bg-emerald-600' : 'bg-emerald-900/20'}`} />
                ))}
            </div>
            
            {/* Interactive Areas */}
            <div className="absolute inset-0 z-20 flex w-full">
                {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCondition(idx); }} />
                ))}
            </div>

            {/* Moving Knob */}
            <motion.div
                className="absolute left-0 w-12 h-12 bg-white rounded-full shadow-lg border border-emerald-100 z-10 flex items-center justify-center text-emerald-600"
                initial={false}
                animate={{ 
                    x: condition === 0 ? 4 : condition === 1 ? 'calc(50% - 24px)' : 'calc(100% - 52px)'
                }}
                transition={SPRING_CONFIG}
            >
                <TrendingUp size={20} />
            </motion.div>
        </div>
        <div className="text-center mt-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            {conditions[condition]}
        </div>
      </div>
    </div>
  );
};

const HybridContent = () => (
  <div className="flex flex-col h-full justify-between relative z-10">
    <div>
        <div className="flex items-center gap-2 mb-1">
            <div className="bg-white/40 p-1.5 rounded-lg text-blue-800"><Coins size={18} /></div>
            <h3 className="font-bold text-xl text-blue-900">Hybrid Pay</h3>
        </div>
        <p className="text-xs text-blue-800/70">Combine items & credits.</p>
    </div>
    
    <div className="relative h-24 flex items-center justify-center">
        {/* Visual of merging currencies */}
        <motion.div
            className="absolute w-16 h-16 rounded-full bg-blue-400/80 mix-blend-multiply flex items-center justify-center text-white text-[10px] font-bold"
            style={{ willChange: 'transform' }}
            animate={{ x: [15, -5, 15], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
            ITEM
        </motion.div>
        <motion.div
            className="absolute w-16 h-16 rounded-full bg-yellow-400/80 mix-blend-multiply flex items-center justify-center text-white text-[10px] font-bold"
            style={{ willChange: 'transform' }}
            animate={{ x: [-15, 5, -15], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
            CASH
        </motion.div>
    </div>
  </div>
);

const EscrowContent = () => (
  <div className="flex flex-col h-full justify-between relative z-10">
    <div className="flex justify-between items-start">
        <div>
            <h3 className="font-bold text-xl text-orange-900">Escrow</h3>
            <p className="text-xs text-orange-800/70">20% Deposit Safe.</p>
        </div>
        <div className="bg-white/50 p-2 rounded-full text-orange-600">
            <ShieldCheck size={20} />
        </div>
    </div>
    
    <div className="bg-orange-900/5 rounded-xl p-3 mt-2 border border-orange-900/10">
        <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-orange-800">Protection Active</span>
        </div>
        <div className="w-full bg-white/50 h-1.5 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-green-500 origin-left"
                animate={{ scaleX: [0.2, 0.2, 1, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.5, 0.6, 1] }}
            />
        </div>
    </div>
  </div>
);

const SustainabilityContent = () => (
    <div className="flex flex-col h-full justify-center items-center relative z-10 text-center gap-2">
        <motion.div 
            animate={{ rotate: [3, -3, 3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20"
        >
            <Leaf size={28} />
        </motion.div>
        <div>
            <h3 className="font-bold text-lg text-green-900">Go Green</h3>
            <div className="text-xs font-medium text-green-700/80 bg-white/40 px-2 py-1 rounded-full mt-1">
                2kg Waste Saved
            </div>
        </div>
    </div>
);

const ChatContent = () => (
    <div className="flex flex-col h-full relative z-10">
         <h3 className="font-bold text-xl text-indigo-900 mb-4">Chat & Swap</h3>
         <div className="space-y-3 flex-1">
             <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/60 p-3 rounded-2xl rounded-tl-sm text-sm text-indigo-900 shadow-sm border border-white/50"
             >
                Is the joystick working?
             </motion.div>
             <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-indigo-500/90 text-white p-3 rounded-2xl rounded-tr-sm text-sm shadow-sm ml-auto max-w-[90%]"
             >
                Yes! Barely used it.
             </motion.div>
         </div>
         <div className="mt-2 flex gap-2 items-center text-xs text-indigo-800/60 font-medium">
             <div className="w-2 h-2 bg-green-500 rounded-full" /> Online Now
         </div>
    </div>
);

// --- Expanded View Components (The "Instruction" Layer) ---

const ExpandedCard = ({ id, close }) => {
    // Content Mapping for Instructions
    const content = {
        valuation: {
            title: "Intelligent Valuation",
            color: "text-emerald-800",
            bg: "bg-emerald-50",
            steps: [
                { title: "Upload Photos", desc: "Our AI scans your item for wear and tear." },
                { title: "Market Compare", desc: "We check prices across 10+ marketplaces." },
                { title: "Get Price Range", desc: "Receive a fair 'Like New' vs 'Used' range." }
            ]
        },
        payments: {
            title: "Hybrid Payments",
            color: "text-blue-800",
            bg: "bg-blue-50",
            steps: [
                { title: "Value Gap?", desc: "Your item is ₹500, theirs is ₹800." },
                { title: "Add Cash", desc: "Pay the ₹300 difference securely." },
                { title: "Or Use Credits", desc: "Earn SwapPoints from previous trades." }
            ]
        },
        escrow: {
            title: "Escrow Protection",
            color: "text-orange-800",
            bg: "bg-orange-50",
            steps: [
                { title: "20% Deposit", desc: "Both parties lock a small deposit." },
                { title: "Exchange Goods", desc: "Meet up or ship the items." },
                { title: "Verify & Release", desc: "Confirm receipt to unlock the deposit." }
            ]
        },
        chat: {
            title: "Direct Negotiation",
            color: "text-indigo-800",
            bg: "bg-indigo-50",
            steps: [
                { title: "Private Channels", desc: "Chat opens only after a match." },
                { title: "Image Sharing", desc: "Send high-res photos in chat." },
                { title: "Offer Button", desc: "Formalize the deal with one tap." }
            ]
        },
        sustainability: {
            title: "Your Impact",
            color: "text-green-800",
            bg: "bg-green-50",
            steps: [
                { title: "Lifespan Extended", desc: "You added 2 years to this product." },
                { title: "Carbon Saved", desc: "Equivalent to driving 50km." },
                { title: "Leaderboard", desc: "Compete with friends for badges." }
            ]
        },
        cta: {
            title: "Join SwapIt",
            color: "text-gray-900",
            bg: "bg-gray-50",
            steps: [
                { title: "Sign Up", desc: "Create your free account." },
                { title: "List Item", desc: "Upload your first item in 30s." },
                { title: "Start Swapping", desc: "Browse local treasures." }
            ]
        }
    }[id];

    if (!content) return null;

    return (
        <motion.div
            className="flex flex-col h-full bg-[#FDFCF8] relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Header */}
            <div className={`p-8 pb-4 border-b border-gray-100 flex justify-between items-center ${content.bg}`}>
                <h2 className={`text-3xl font-black tracking-tight ${content.color}`}>{content.title}</h2>
                <button
                    onClick={(e) => { e.stopPropagation(); close(); }}
                    className="w-10 h-10 rounded-full bg-white/50 hover:bg-white flex items-center justify-center transition-colors shadow-sm"
                >
                    <X size={20} className={content.color} />
                </button>
            </div>

            {/* Instruction Body */}
            <div className="p-8 overflow-y-auto">
                <p className="text-lg text-gray-500 font-medium mb-8">How it works:</p>
                
                <div className="grid md:grid-cols-3 gap-6">
                    {content.steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 + (idx * 0.1) }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`w-8 h-8 rounded-full ${content.bg} flex items-center justify-center font-bold ${content.color} mb-4`}>
                                {idx + 1}
                            </div>
                            <h4 className={`font-bold text-lg mb-2 ${content.color}`}>{step.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 p-6 rounded-3xl bg-gray-900 text-white flex justify-between items-center">
                    <div>
                        <div className="font-bold text-lg">Ready to try?</div>
                        <div className="text-gray-400 text-sm">Experience the future of bartering.</div>
                    </div>
                    <button className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform">
                        Explore Demo
                    </button>
                </div>
            </div>
        </motion.div>
    );
};


// --- Bento Grid Item Wrapper ---

const BentoItem = ({ id, className, children, expandedId, setExpandedId, gradient }) => {
  const isExpanded = expandedId === id;

  return (
    <motion.div
      layoutId={`card-${id}`}
      onClick={() => setExpandedId(id)}
      className={`${className} relative overflow-hidden cursor-pointer group rounded-[32px] ${isExpanded ? 'z-50' : 'z-0'}`}
      whileHover={{ scale: 0.98, y: -6, rotate: -0.3 }}
      whileTap={TAP_PULSE}
      animate={!isExpanded ? CARD_IDLE.animate : {}}
      transition={SPRING_CONFIG}
      style={{ willChange: 'transform' }} // Hint for browser optimization
    >
      {/* Background Gradient & Blur */}
      {!isExpanded && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 transition-opacity duration-300`} />
      )}
      
      {/* Glass Effect Layer */}
      <div className={`absolute inset-0 ${THEME.glass} transition-opacity duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`} />

      {/* Content Container */}
      <div className={`relative h-full w-full p-5 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {children}
      </div>
    </motion.div>
  );
};

// --- Main Hero Section ---

const Hero = () => {
    const navigate = useNavigate(); // 2. Hook added to Hero for "Start Trading"
    const { scrollY } = useScroll();
    const yText = useTransform(scrollY, [0, 300], [0, 100]);
    const opacityText = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section className="h-[80vh] flex flex-col items-center justify-center text-center px-4 relative">
            <motion.div style={{ y: yText, opacity: opacityText }} className="max-w-3xl z-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/40 border border-white/60 text-emerald-900 font-bold text-xs uppercase tracking-widest backdrop-blur-sm shadow-sm"
                >
                    Nature's Economy
                </motion.div>
                
                <h1 className="text-6xl md:text-8xl font-black text-emerald-950 mb-10 drop-shadow-sm tracking-tighter">
                    <motion.div
                        style={{ willChange: "transform" }}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    >
                        Swap. Share. <br />
                    </motion.div>

                    <motion.span
                        className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 inline-block"
                        animate={{ rotate: [0, 0.6, -0.6, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                        Sustain.
                    </motion.span>
                </h1>
                
                <p className="text-xl text-emerald-900/70 font-medium max-w-xl mx-auto leading-relaxed">
                    A circular marketplace that feels as natural as giving a gift. Trade what you have for what you need.
                </p>
                
                <div className="mt-12 mb-20 flex justify-center gap-4">
                      <motion.button
                        onClick={() => navigate('/login')} // 3. "Start Trading" now navigates to Login
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-emerald-900 text-[#F7F5E6] rounded-full font-bold shadow-lg shadow-emerald-900/20"
                      >
                        Start Trading
                      </motion.button>
                </div>
            </motion.div>
        </section>
    );
};

// --- Main Welcome Component ---

// 4. Renamed from App to Welcome
export default function Welcome() {
  const navigate = useNavigate(); // 5. Hook added to main component
  const [expandedId, setExpandedId] = useState(null);
  const { scrollY } = useScroll();
  const gridY = useTransform(scrollY, [200, 800], [0, -60]);

  return (
    <div className={`min-h-screen ${THEME.paper} text-gray-900 font-sans selection:bg-emerald-200 selection:text-emerald-900`}>
      <GrainOverlay />
      <CustomCursor />
      <PaintedBackground />

      <nav className="fixed top-0 w-full z-40 px-6 py-6 flex justify-between items-center mix-blend-hard-light">
         <div className="text-2xl font-black text-emerald-900 flex items-center gap-2 tracking-tighter">
            <RefreshCcw size={24} /> SwapIt
         </div>
         {/* 6. "Join Now" now navigates to Register */}
         <button 
            onClick={() => navigate('/register')}
            className="bg-emerald-900 text-[#F7F5E6] px-5 py-2 rounded-full font-bold text-sm hover:shadow-lg transition-shadow"
         >
            Join Now
         </button>
      </nav>

      <main className="relative z-10 pb-20">
        <Hero />

        {/* Bento Grid */}
        <div className="max-w-6xl mx-auto px-4 relative z-20">
            <motion.div style={{ y: gridY }} className="grid grid-cols-1 md:grid-cols-4 grid-rows-4 md:grid-rows-3 gap-5 h-[1100px] md:h-[750px]">
                
                {/* 1. Valuation */}
                <BentoItem
                    id="valuation"
                    className="md:col-span-2 md:row-span-2"
                    gradient={THEME.meadow}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                >
                    <ValuationContent />
                </BentoItem>

                {/* 2. Payments */}
                <BentoItem
                    id="payments"
                    className="md:col-span-1 md:row-span-1"
                    gradient={THEME.sky}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                >
                    <HybridContent />
                </BentoItem>

                {/* 3. Escrow */}
                <BentoItem
                    id="escrow"
                    className="md:col-span-1 md:row-span-1"
                    gradient={THEME.sunset}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                >
                    <EscrowContent />
                </BentoItem>

                {/* 4. Chat */}
                <BentoItem
                    id="chat"
                    className="md:col-span-1 md:row-span-2"
                    gradient="from-indigo-200 to-purple-200"
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                >
                    <ChatContent />
                </BentoItem>

                {/* 5. Sustainability */}
                <BentoItem
                    id="sustainability"
                    className="md:col-span-1 md:row-span-1"
                    gradient="from-emerald-200 to-green-300"
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                >
                    <SustainabilityContent />
                </BentoItem>

                {/* 6. CTA */}
                <BentoItem
                    id="cta"
                    className="md:col-span-2 md:row-span-1 bg-gray-900"
                    gradient="from-gray-800 to-gray-900"
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                >
                    <div className="flex items-center justify-between h-full p-4 relative z-10 text-white">
                        <div>
                            <div className="text-2xl font-bold">Community First.</div>
                            <div className="text-gray-400">Join 50,000+ local swappers.</div>
                        </div>
                        {/* 7. CTA Arrow navigates to Register */}
                        <div 
                            className="bg-white text-black p-3 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate('/register'); }}
                        >
                            <ArrowRight />
                        </div>
                    </div>
                </BentoItem>
            </motion.div>
        </div>
      </main>

      {/* Expanded Modal Layer */}
      <AnimatePresence>
        {expandedId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedId(null)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div
              layoutId={`card-${expandedId}`}
              initial={{ scale: 0.8, rotateX: -15, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="w-full max-w-5xl h-full md:h-[85%] bg-[#FDFCF8] rounded-[32px] shadow-2xl overflow-hidden relative z-10"
            >
               <ExpandedCard id={expandedId} close={() => setExpandedId(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="text-center py-8 text-emerald-900/40 text-sm font-medium relative z-10">
        <p>Designed with ❤️ SwapIt.io</p>
      </footer>
    </div>
  );
}