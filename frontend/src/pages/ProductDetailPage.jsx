import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  Check, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Cpu,
  Layers
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCloud } from '../context/CloudContext';

export const ProductDetailPage = ({ product, onBack, setActiveTab }) => {
  const { addToCart } = useCart();
  const { metrics } = useCloud();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb / Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </button>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
        
        {/* Product Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Product Info & Purchase Options */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Rating & Stock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full text-xs font-bold text-amber-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-amber-600/70 font-normal">({product.reviewsCount} reviews)</span>
              </div>

              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock ({product.stockCount} units available)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              {product.name}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Price section */}
            <div className="pt-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-950">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-slate-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    Save ${product.originalPrice - product.price}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 w-32 justify-between px-3 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-slate-600 hover:text-slate-950 text-base font-bold px-1"
                >
                  -
                </button>
                <span className="text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  className="text-slate-600 hover:text-slate-950 text-base font-bold px-1"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 hover:bg-emerald-600 text-white active:scale-98'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart • ${(product.price * quantity).toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>

            {/* Cloud simulator telemetry pill */}
            <div className="p-3 rounded-xl bg-slate-900 text-slate-300 text-xs font-mono flex items-center justify-between border border-slate-800">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                Live API Node:
              </span>
              <span className="text-emerald-400 font-bold">{metrics.lastServedInstance}</span>
            </div>

          </div>

          {/* Guarantees */}
          <div className="border-t border-slate-100 pt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-slate-400" />
              <span>Fast Dispatch</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Official Warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>30-Day Guarantee</span>
            </div>
          </div>

        </div>

      </div>

      {/* Specifications Table */}
      {product.specs && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Technical Specifications
          </h2>
          <div className="divide-y divide-slate-100">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                <span className="font-semibold text-slate-500 w-48">{key}</span>
                <span className="text-slate-900 font-medium font-mono sm:text-right flex-1">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

