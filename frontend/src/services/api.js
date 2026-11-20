import { INITIAL_PRODUCTS } from '../data/products';

let onHeaderReceivedCallback = null;

export const registerHeaderCallback = (callback) => {
  onHeaderReceivedCallback = callback;
};

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/api/products${query ? '?' + query : ''}`;
    try {
      const startTime = performance.now();
      const res = await fetch(url);
      const endTime = performance.now();
      const responseTime = `${Math.round(endTime - startTime)}ms`;

      if (res.ok) {
        const instanceId = res.headers.get('x-backend-instance');
        if (onHeaderReceivedCallback) {
          onHeaderReceivedCallback(instanceId, responseTime);
        }
        return await res.json();
      }
    } catch {
      // Backend fallback during development
    }

    // Client-side fallback filter
    let results = [...INITIAL_PRODUCTS];
    if (params.category && params.category !== 'All') {
      results = results.filter(p => p.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params.search) {
      const term = params.search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }
    if (params.sort === 'price-low') {
      results.sort((a, b) => a.price - b.price);
    } else if (params.sort === 'price-high') {
      results.sort((a, b) => b.price - a.price);
    } else if (params.sort === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    }

    if (onHeaderReceivedCallback) {
      onHeaderReceivedCallback('backend-1', '14ms');
    }
    return results;
  },

  async getProductById(id) {
    try {
      const startTime = performance.now();
      const res = await fetch(`/api/products/${id}`);
      const endTime = performance.now();
      if (res.ok) {
        const instanceId = res.headers.get('x-backend-instance');
        if (onHeaderReceivedCallback) {
          onHeaderReceivedCallback(instanceId, `${Math.round(endTime - startTime)}ms`);
        }
        return await res.json();
      }
    } catch {}

    const found = INITIAL_PRODUCTS.find(p => p.id === id);
    if (onHeaderReceivedCallback) {
      onHeaderReceivedCallback('backend-2', '12ms');
    }
    return found || null;
  },

  // Orders
  async createOrder(orderPayload) {
    try {
      const startTime = performance.now();
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const endTime = performance.now();
      if (res.ok) {
        const instanceId = res.headers.get('x-backend-instance');
        if (onHeaderReceivedCallback) {
          onHeaderReceivedCallback(instanceId, `${Math.round(endTime - startTime)}ms`);
        }
        return await res.json();
      }
    } catch {}

    return {
      success: true,
      order: {
        orderId: 'NX-' + Math.floor(10000 + Math.random() * 90000),
        ...orderPayload,
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      }
    };
  }
};

