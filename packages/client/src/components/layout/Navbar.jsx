import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, LayoutGrid, Wallet, User, Plus } from 'lucide-react'; // Changed LogOut to User
import { THEME } from './PageWrapper';

const Navbar = () => {
  const navItems = [
    { path: '/marketplace', icon: Compass, label: 'Explore' },
    { path: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { path: '/create-listing', icon: Plus, label: 'List', isMain: true },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav className={`flex items-center gap-2 p-2 rounded-3xl ${THEME.glass} shadow-2xl shadow-emerald-900/20`}>
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300
              ${item.isMain 
                ? 'bg-emerald-900 text-[#F7F5E6] shadow-lg shadow-emerald-900/30 -mt-6 h-16 w-16 mb-2' 
                : isActive 
                  ? 'bg-emerald-900/10 text-emerald-900' 
                  : 'text-emerald-900/40 hover:bg-emerald-900/5 hover:text-emerald-900/60'
              }
            `}
          >
            <item.icon size={item.isMain ? 28 : 22} strokeWidth={item.isMain ? 2 : 2.5} />
          </NavLink>
        ))}

        {/* Separator */}
        <div className="w-px h-8 bg-emerald-900/10 mx-1" />

        {/* Profile Link (New) */}
        <NavLink
          to="/profile"
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all
            ${isActive ? 'bg-emerald-900/10 text-emerald-900' : 'text-emerald-900/40 hover:bg-emerald-900/5'}
          `}
        >
          <User size={22} strokeWidth={2.5} />
        </NavLink>

      </nav>
    </div>
  );
};

export default Navbar;