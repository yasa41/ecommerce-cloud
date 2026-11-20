const User = require('../models/User');
const { isMongoConnected, loadFallbackStore, saveFallbackStore } = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    if (isMongoConnected()) {
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          name: email.split('@')[0],
          email,
          role: 'customer'
        });
        await user.save();
      }
      return res.json({ success: true, user });
    }

    const store = loadFallbackStore();
    store.users = store.users || [];
    let user = store.users.find(u => u.email === email);
    if (!user) {
      user = {
        name: email.split('@')[0],
        email,
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      store.users.push(user);
      saveFallbackStore(store);
    }

    return res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

    if (isMongoConnected()) {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ error: 'Email already registered' });
      user = new User({ name, email, role: 'customer' });
      await user.save();
      return res.status(201).json({ success: true, user });
    }

    const store = loadFallbackStore();
    store.users = store.users || [];
    if (store.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const user = { name, email, role: 'customer', createdAt: new Date().toISOString() };
    store.users.push(user);
    saveFallbackStore(store);

    return res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

