import React, { useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { useLocation } from 'react-router-dom'; // Import useLocation
import Navbar from './Navbar'; // Import Navbar

// --- SHARED THEME CONSTANTS ---
export const THEME = {
  paper: "bg-[#F7F5E6]",
  glass: "backdrop-blur-md bg-white/30 border border-white/40 shadow-xl ring-1 ring-white/50",
  textMain: "text-emerald-950",
  textSec: "text-emerald-800/70",
  accent: "bg-emerald-900",
};

export const SPRING_CONFIG = { type: "spring", stiffness: 250, damping: 25, mass: 1 };

// --- BACKGROUND COMPONENTS ---

const GrainOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] opacity-20 mix-blend-multiply"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden'
    }}
  />
);

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

const PaintedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#F2F0E4]" style={{ transform: 'translateZ(0)' }}>
    <motion.div
      animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-green-300/30 rounded-full blur-[100px] mix-blend-multiply"
    />
    <motion.div
      animate={{ x: [0, -40, 0], y: [0, 60, 0], scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-blue-300/30 rounded-full blur-[120px] mix-blend-multiply"
    />
    <motion.div
      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-pink-200/40 rounded-full blur-[90px] mix-blend-multiply"
    />
  </div>
);

// --- MAIN WRAPPER COMPONENT ---
const PageWrapper = ({ children, className = "" }) => {
  const location = useLocation();
  
  // Define public routes where Navbar should NOT appear
  const publicRoutes = ['/', '/login', '/register'];
  const showNavbar = !publicRoutes.includes(location.pathname);

  return (
    <div className={`min-h-screen ${THEME.paper} text-gray-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden`}>
      <GrainOverlay />
      <CustomCursor />
      <PaintedBackground />
      
      <div className={`relative z-10 ${className}`}>
        {children}
      </div>

      {/* Conditionally Render Navbar */}
      {showNavbar && <Navbar />}
    </div>
  );
};

export default PageWrapper;