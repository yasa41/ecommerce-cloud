const Order = require('../models/Order');
const { isMongoConnected, loadFallbackStore, saveFallbackStore } = require('../config/db');

exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const orderId = 'NX-' + Math.floor(10000 + Math.random() * 90000);
    const newOrder = {
      orderId,
      ...orderData,
      servedBy: process.env.NODE_INSTANCE_ID || 'backend-1',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected()) {
      const doc = new Order(newOrder);
      await doc.save();
      return res.status(201).json({ success: true, order: doc });
    }

    const store = loadFallbackStore();
    store.orders = store.orders || [];
    store.orders.unshift(newOrder);
    saveFallbackStore(store);

    return res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    }

    const store = loadFallbackStore();
    return res.json(store.orders || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

