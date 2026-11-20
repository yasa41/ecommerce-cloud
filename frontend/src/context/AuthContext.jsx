import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_user');
      return saved ? JSON.parse(saved) : {
        name: 'Alex Mercer',
        email: 'alex.mercer@example.com',
        role: 'customer'
      };
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_orders');
      return saved ? JSON.parse(saved) : [
        {
          orderId: 'NX-89214',
          date: '2026-11-10T14:32:00Z',
          items: [
            { id: 'prod-3', name: 'Nexora Acoustic Pro Wireless ANC', price: 349, quantity: 1 }
          ],
          total: 376.92,
          status: 'Delivered',
          shippingAddress: '450 Innovation Parkway, Suite 800, Silicon Valley, CA'
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('nexora_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('nexora_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('nexora_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  const login = (email, password) => {
    const newUser = {
      name: email.split('@')[0].toUpperCase(),
      email,
      role: 'customer'
    };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const register = (name, email, password) => {
    const newUser = { name, email, role: 'customer' };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
  };

  const addOrder = (orderData) => {
    const newOrder = {
      orderId: 'NX-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString(),
      ...orderData
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        orders,
        addOrder
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

