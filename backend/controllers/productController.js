const Product = require('../models/Product');
const { isMongoConnected, loadFallbackStore } = require('../config/db');

exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    if (isMongoConnected()) {
      let query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      let cursor = Product.find(query);
      if (sort === 'price-low') cursor = cursor.sort({ price: 1 });
      else if (sort === 'price-high') cursor = cursor.sort({ price: -1 });
      else if (sort === 'rating') cursor = cursor.sort({ rating: -1 });

      const products = await cursor.exec();
      return res.json(products);
    }

    // Fallback in-file JSON
    const store = loadFallbackStore();
    let results = [...(store.products || [])];

    if (category && category !== 'All') {
      results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const term = search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }
    if (sort === 'price-low') results.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') results.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);

    return res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const product = await Product.findOne({ id });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      return res.json(product);
    }

    const store = loadFallbackStore();
    const product = (store.products || []).find(p => p.id === id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

