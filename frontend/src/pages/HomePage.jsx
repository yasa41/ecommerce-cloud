import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Zap, 
  Layers, 
  Cpu,
  Sparkles
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

export const HomePage = ({ products, onSelectProduct, setActiveTab, onSelectCategory }) => {
  const featured = products.filter(p => p.featured);
  const trending = products.filter(p => p.trending);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Cloud Commerce
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Engineered for <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Pure Performance
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-lg leading-relaxed">
              Explore NEXORA's flagship ecosystem of smartphones, high-performance creator laptops, and precision wireless audio.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab('products')}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:gap-3"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('cloud')}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Cloud Control Center</span>
              </button>
            </div>
          </div>

          {/* Hero product showcase card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl group">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80"
                  alt="Flagship Phone"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-emerald-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-full">
                  NEW RELEASE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Nexora Titan X Pro 5G</h3>
                  <p className="text-xs text-slate-400">Quantum Bionic 4nm Processor • 108MP</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-emerald-400">$1,199</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Complimentary Express</h4>
              <p className="text-xs text-slate-500 mt-0.5">Free 2-day delivery on all orders over $500</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">2-Year Warranty</h4>
              <p className="text-xs text-slate-500 mt-0.5">Official manufacturer coverage included</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">30-Day Returns</h4>
              <p className="text-xs text-slate-500 mt-0.5">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Simulated Cloud Core</h4>
              <p className="text-xs text-slate-500 mt-0.5">Load balanced across active Node.js servers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-emerald-600">
              Curated Selection
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Featured Flagships
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('products')}
            className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* Cloud Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-8 sm:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" /> High Availability Simulator
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold">
              Experience Local Auto-Scaling & Load Balancing
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every click, search, and checkout request you make is dynamically distributed across live Express server processes. Open the Cloud Control Center to watch traffic curves and auto-scaling in action.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('cloud')}
            className="whitespace-nowrap px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            Open Cloud Control Center
          </button>
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-emerald-600">
              Community Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Trending Right Now
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('products')}
            className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Explore More</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onSelectProduct}
            />
          ))}
        </div>
      </section>

    </div>
  );
};

