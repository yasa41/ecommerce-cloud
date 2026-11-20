import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle, 
  ArrowLeft, 
  Cpu, 
  Package, 
  Truck,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCloud } from '../context/CloudContext';
import { api } from '../services/api';

export const CheckoutPage = ({ setActiveTab }) => {
  const { cartItems, orderTotal, shipping, estimatedTax, subtotal, clearCart } = useCart();
  const { user, addOrder } = useAuth();
  const { metrics } = useCloud();

  const [formData, setFormData] = useState({
    fullName: user ? user.name : 'Alex Mercer',
    email: user ? user.email : 'alex.mercer@example.com',
    phone: '+1 (555) 234-5678',
    address: '450 Innovation Parkway, Suite 800',
    city: 'San Jose',
    state: 'CA',
    zip: '95134',
    cardNumber: '4242 •••• •••• 4242',
    cardExp: '12/28',
    cardCvc: '888'
  });

  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const orderPayload = {
      customer: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone
      },
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      shipping,
      tax: estimatedTax,
      total: orderTotal,
      servedBy: metrics.lastServedInstance
    };

    // Call API (routes through load balancer to active backend)
    const result = await api.createOrder(orderPayload);
    const savedOrder = addOrder(result.order || orderPayload);

    setTimeout(() => {
      setProcessing(false);
      setCompletedOrder(savedOrder);
      clearCart();
    }, 900);
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Order Confirmed!
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Thank you for shopping with NEXORA. Your order has been processed and saved to our synchronized database.
        </p>

        {/* Order details badge */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left space-y-4 shadow-sm text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="font-semibold text-slate-500">Order Reference:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{completedOrder.orderId}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="font-semibold text-slate-500">Processed by Instance:</span>
            <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              {completedOrder.servedBy || metrics.lastServedInstance}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="font-semibold text-slate-500">Shipping To:</span>
            <span className="text-slate-900 font-medium text-right max-w-xs">{completedOrder.shippingAddress}</span>
          </div>
          <div className="flex justify-between items-center pt-1 text-sm font-bold text-slate-950">
            <span>Amount Paid:</span>
            <span className="text-emerald-600 font-mono">${orderTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('account')}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all"
          >
            View in Order History
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No items to checkout</h2>
        <button
          onClick={() => setActiveTab('products')}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <button
        onClick={() => setActiveTab('cart')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shopping Cart</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Checkout Forms */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* Customer & Shipping Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                1. Customer & Shipping Address
              </h2>
              <span className="text-xs font-mono text-emerald-600 font-semibold">Step 1 of 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                2. Simulated Instant Payment
              </h2>
              <span className="text-xs font-mono text-emerald-600 font-semibold">Test Sandbox</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Card Number (Simulated)</label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={formData.cardExp}
                    onChange={(e) => setFormData({ ...formData, cardExp: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Security Code (CVC)</label>
                  <input
                    type="text"
                    value={formData.cardCvc}
                    onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {processing ? (
                <span>Routing to {metrics.lastServedInstance}...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Place Order • ${orderTotal.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Mini Order Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 h-fit">
          <h3 className="text-base font-bold text-slate-900">
            Order Review ({cartItems.length} items)
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 font-mono">{item.quantity}x</span>
                  <span className="text-slate-800 line-clamp-1">{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 whitespace-nowrap">
                  ${(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-medium">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-mono font-medium">{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (8%)</span>
              <span className="font-mono font-medium">${estimatedTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-950 pt-2 border-t border-slate-100">
              <span>Total</span>
              <span className="font-mono text-emerald-600 text-base">${orderTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Infrastructure Routing Node Notification */}
          <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-mono space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Target Load Balancer:</span>
              <span className="text-emerald-400 font-bold">:5000</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Handled Instance:</span>
              <span className="text-emerald-400 font-bold">{metrics.lastServedInstance}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

