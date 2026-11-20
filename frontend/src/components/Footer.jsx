import React from 'react';
import { Cpu, Server, ShieldCheck, Zap } from 'lucide-react';

export const Footer = ({ setActiveTab }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-wider">NEXORA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Next-generation electronics shopping platform powered by a distributed local cloud simulation architecture.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-slate-900 border border-slate-800 text-emerald-400 font-mono">
                <Server className="w-3 h-3" /> Multi-Instance Node.js
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Shop Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('products')} className="hover:text-emerald-400 transition-colors">Smartphones</button></li>
              <li><button onClick={() => setActiveTab('products')} className="hover:text-emerald-400 transition-colors">Laptops & Workstations</button></li>
              <li><button onClick={() => setActiveTab('products')} className="hover:text-emerald-400 transition-colors">Wireless Audio</button></li>
              <li><button onClick={() => setActiveTab('products')} className="hover:text-emerald-400 transition-colors">Smartwatches</button></li>
              <li><button onClick={() => setActiveTab('products')} className="hover:text-emerald-400 transition-colors">Gaming Peripherals</button></li>
            </ul>
          </div>

          {/* Architecture highlights */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Cloud Architecture
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> Round-Robin Load Balancer (:5000)
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Server className="w-3.5 h-3.5 text-blue-400" /> Dynamic 2-4 Backend Instances
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Automated Auto-Scaling Controller
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-amber-400" /> Shared MongoDB Persistence
              </li>
            </ul>
          </div>

          {/* Live System Control */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Infrastructure Control
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect real-time metrics, node distribution, and trigger live auto-scaling simulation.
            </p>
            <button
              onClick={() => setActiveTab('cloud')}
              className="w-full py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Server className="w-3.5 h-3.5" />
              Launch Cloud Control Center
            </button>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 NEXORA Cloud Systems. Designed for Local Infrastructure Demonstration.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

