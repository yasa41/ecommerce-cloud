const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: {
    name: String,
    email: String,
    phone: String
  },
  shippingAddress: String,
  items: [orderItemSchema],
  subtotal: Number,
  shipping: Number,
  tax: Number,
  total: Number,
  status: { type: String, default: 'Confirmed' },
  servedBy: String
}, {
  timestamps: true
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);

