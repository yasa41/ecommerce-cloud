import React from 'react';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage = ({ setActiveTab, onSelectProduct }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    shipping, 
    estimatedTax, 
    orderTotal 
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your shopping cart is empty</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Explore our premium ecosystem of smartphones, laptops, and studio audio devices.
        </p>
        <button
          onClick={() => setActiveTab('products')}
          className="mt-4 px-6 py-3 bg-slate-900 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-all inline-flex items-center gap-2"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected devices before checkout
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div 
                onClick={() => onSelectProduct(item)}
                className="flex items-center gap-4 cursor-pointer w-full sm:w-auto"
              >
                <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="font-semibold text-sm text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    ${item.price} each
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 px-2 py-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="text-slate-600 hover:text-slate-900 px-2 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold font-mono px-2 text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-slate-600 hover:text-slate-900 px-2 text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                <span className="font-bold font-mono text-sm text-slate-900 min-w-16 text-right">
                  ${(item.price * item.quantity).toLocaleString()}
                </span>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 h-fit">
          <h2 className="text-base font-bold text-slate-900">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs divide-y divide-slate-100">
            <div className="flex justify-between text-slate-600 pb-2">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-slate-900">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 py-2">
              <span>Estimated Shipping</span>
              <span className="font-mono font-semibold text-slate-900">
                {shipping === 0 ? <strong className="text-emerald-600">FREE</strong> : `$${shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 py-2">
              <span>Estimated Sales Tax (8%)</span>
              <span className="font-mono font-semibold text-slate-900">${estimatedTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-950 pt-3">
              <span>Order Total</span>
              <span className="font-mono text-base text-emerald-600">${orderTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('checkout')}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Simulated 256-bit Encrypted Checkout</span>
          </div>
        </div>

      </div>

    </div>
  );
};

