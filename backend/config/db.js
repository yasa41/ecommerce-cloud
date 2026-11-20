const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '..', 'seed', 'products.json');
const STORE_FILE = path.join(__dirname, '..', 'data_store.json');

let isMongoConnected = false;
let dbStatus = 'Initializing';

// In-file store helpers for resilience
function loadFallbackStore() {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      const initialProducts = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
      const initialStore = {
        products: initialProducts,
        orders: [],
        users: []
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initialStore, null, 2));
      return initialStore;
    }
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error loading fallback store:', err);
    return { products: [], orders: [], users: [] };
  }
}

function saveFallbackStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing fallback store:', err);
  }
}

// Connect to MongoDB
async function connectDB(mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexora') {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    dbStatus = 'Connected to MongoDB (27017)';
    console.log(`[Database] Connected successfully to MongoDB: ${mongoUri}`);
    await seedMongoIfEmpty();
  } catch (err) {
    isMongoConnected = false;
    dbStatus = 'Fallback JSON Database Active';
    console.warn(`[Database] MongoDB not reachable (${err.message}). Using shared persistent JSON store.`);
    loadFallbackStore(); // ensure file exists
  }
}

// Seed Mongo if empty
async function seedMongoIfEmpty() {
  if (!isMongoConnected) return;
  try {
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const count = await Product.countDocuments();
    if (count === 0) {
      const seedProducts = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
      await Product.insertMany(seedProducts);
      console.log(`[Database] Seeded ${seedProducts.length} electronics products into MongoDB.`);
    }
  } catch (err) {
    console.error('[Database] Failed to seed MongoDB:', err);
  }
}

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  getDbStatus: () => dbStatus,
  loadFallbackStore,
  saveFallbackStore
};

