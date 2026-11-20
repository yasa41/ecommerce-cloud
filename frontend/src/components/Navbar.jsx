import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Cpu, 
  Search, 
  User, 
  Menu, 
  X, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCloud } from '../context/CloudContext';
import { InstanceBadge } from './InstanceBadge';

export const Navbar = ({ activeTab, setActiveTab, onSearch }) => {
  const { totalItemsCount } = useCart();
  const { metrics, isLiveConnected } = useCloud();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchInput);
      setActiveTab('products');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all">
      {/* Top micro-bar: Cloud status & Load Balancer Live Routing indicator */}
      <div className="bg-slate-950 px-4 py-1 text-xs border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              Cluster: <strong className="text-slate-200">{metrics.activeCount || 2} Nodes Active</strong>
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              Round-Robin Load Balancer: <span className="text-emerald-400 font-mono">:5000</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden md:inline">Last served by:</span>
            <InstanceBadge compact />
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                NEXORA
              </span>
              <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-mono -mt-1 font-semibold">
                Cloud Electronics
              </span>
            </div>
          </div>

          {/* Search bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <input
              type="text"
              placeholder="Search smartphones, laptops, audio..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'home' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'products' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Catalog
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'account' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Account
            </button>
          </nav>

          {/* Action CTAs: Cart + Cloud Control Center */}
          <div className="flex items-center gap-3">
            {/* Cloud Control Center Pill */}
            <button
              onClick={() => setActiveTab('cloud')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'cloud'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Cloud Simulator</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </button>

            {/* Shopping Cart button */}
            <button
              onClick={() => setActiveTab('cart')}
              className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 transition-colors"
              title="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search items..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex flex-col gap-1 text-sm font-medium">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
            >
              All Products
            </button>
            <button
              onClick={() => { setActiveTab('account'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
            >
              My Account & Orders
            </button>
            <button
              onClick={() => { setActiveTab('cloud'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-lg text-emerald-400 bg-emerald-500/10 font-semibold"
            >
              Open Cloud Control Center
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

