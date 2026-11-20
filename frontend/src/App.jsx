import React, { useState, useEffect } from 'react';
import { CloudProvider, useCloud } from './context/CloudContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { CloudDashboardPage } from './pages/CloudDashboardPage';
import { api, registerHeaderCallback } from './services/api';
import { INITIAL_PRODUCTS } from './data/products';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSearch, setActiveSearch] = useState('');

  const { recordApiCall } = useCloud();

  // Connect API response headers to cloud metrics
  useEffect(() => {
    registerHeaderCallback((instanceId, responseTime) => {
      recordApiCall(instanceId, responseTime);
    });

    // Initial load from backend (or fallback)
    api.getProducts().then(data => {
      if (data && data.length > 0) {
        setProducts(data);
      }
    });
  }, [recordApiCall]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setActiveTab('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category) => {
    setActiveCategory(category);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query) => {
    setActiveSearch(query);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSearch={handleSearch} 
      />

      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            products={products}
            onSelectProduct={handleSelectProduct}
            setActiveTab={setActiveTab}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {activeTab === 'products' && (
          <ProductsPage
            products={products}
            onSelectProduct={handleSelectProduct}
            initialCategory={activeCategory}
            initialSearch={activeSearch}
          />
        )}

        {activeTab === 'details' && (
          <ProductDetailPage
            product={selectedProduct || products[0]}
            onBack={() => setActiveTab('products')}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'cart' && (
          <CartPage
            setActiveTab={setActiveTab}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutPage
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'account' && (
          <AccountPage
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'cloud' && (
          <CloudDashboardPage />
        )}
      </main>

      {activeTab !== 'cloud' && <Footer setActiveTab={setActiveTab} />}
    </div>
  );
}

export default function App() {
  return (
    <CloudProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </CloudProvider>
  );
}

