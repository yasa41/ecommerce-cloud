const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 120 },
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number, default: 50 },
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  image: { type: String, required: true },
  description: { type: String, required: true },
  specs: { type: Map, of: String }
}, {
  timestamps: true
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);

