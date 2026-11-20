import React, { useState } from 'react';
import { 
  User, 
  Package, 
  Clock, 
  CheckCircle, 
  Cpu, 
  LogOut, 
  LogIn, 
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCloud } from '../context/CloudContext';

export const AccountPage = ({ setActiveTab }) => {
  const { user, login, register, logout, orders } = useAuth();
  const { metrics } = useCloud();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    if (isRegister) {
      register(name, email, password);
    } else {
      login(email, password);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <span className="text-xs uppercase font-mono font-semibold tracking-wider text-emerald-600">
            User Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            My Account & Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Synced across all distributed backend instances
          </p>
        </div>

        {user && (
          <button
            onClick={logout}
            className="self-start sm:self-auto px-4 py-2 border border-slate-300 hover:border-red-400 text-slate-700 hover:text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Card / Login Box */}
        <div className="space-y-6">
          {user ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{user.name}</h2>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                    Verified Customer
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Account Status</span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Orders</span>
                  <span className="font-semibold text-slate-900">{orders.length}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Assigned Cluster Session</span>
                  <span className="font-mono text-emerald-600 font-bold">{metrics.lastServedInstance}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">
                  {isRegister ? 'Create Account' : 'Sign In'}
                </h2>
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-xs text-emerald-600 hover:underline font-semibold"
                >
                  {isRegister ? 'Have an account?' : 'Need an account?'}
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4 text-xs">
                {isRegister && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Lee"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  {isRegister ? 'Register' : 'Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* Database Synchronization Indicator */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
              <Cpu className="w-4 h-4" />
              Shared MongoDB Sync
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All your cart modifications, authentication sessions, and past orders are stored in a unified database layer accessible to all {metrics.activeCount || 2} server instances.
            </p>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                Past Order History
              </h2>
              <span className="text-xs font-mono text-slate-400">{orders.length} orders recorded</span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-800">No previous orders</h3>
                <p className="text-xs text-slate-500">Your completed purchases will appear here.</p>
                <button
                  onClick={() => setActiveTab('products')}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.orderId}
                    className="border border-slate-100 hover:border-slate-300 bg-slate-50/50 rounded-2xl p-5 space-y-3 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3 text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm">{order.orderId}</span>
                        <span className="text-slate-400 ml-2">
                          {order.date ? new Date(order.date).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          {order.status || 'Confirmed'}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">
                          ${typeof order.total === 'number' ? order.total.toLocaleString() : order.total}
                        </span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-1 text-xs">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-600">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-mono">${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Processed node */}
                    <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-200/50">
                      <span>Routing Instance:</span>
                      <span className="text-emerald-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                        {order.servedBy || 'backend-1'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

