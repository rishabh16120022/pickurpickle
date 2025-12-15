import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import authRoutes from './routes/authRoutes.js';
import User from './models/User.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow all origins for simplicity in this VPS setup
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check
app.get('/', (req, res) => res.send('API is Running'));

// Database Connection Logic
const connectDB = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/pick-your-pickle';
    
    const maskedString = connString.replace(/:([^:@]+)@/, ':****@');
    console.log(`📡 Attempting to connect to: ${maskedString}`);

    await mongoose.connect(connString);
    
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    
    // Seed Admin User
    await seedAdmin();

  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};

const seedAdmin = async () => {
  try {
    const adminEmail = "rishutripathi161@gmail.com";
    const adminPass = "rishabh1126";
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPass, salt);
      
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      console.log("🛡️  Default Admin Account Created");
    } else {
        // Optional: Ensure the role is always admin for this email
        if(existingAdmin.role !== 'admin') {
            existingAdmin.role = 'admin';
            await existingAdmin.save();
        }
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};

connectDB();

// --- Routes ---

// 1. Auth Routes
app.use('/api/auth', authRoutes);

// 2. Store APIs
const Schema = mongoose.Schema;

const Product = mongoose.models.Product || mongoose.model('Product', new Schema({}, { strict: false }));
const Category = mongoose.models.Category || mongoose.model('Category', new Schema({}, { strict: false }));
const Review = mongoose.models.Review || mongoose.model('Review', new Schema({}, { strict: false }));
const Order = mongoose.models.Order || mongoose.model('Order', new Schema({}, { strict: false }));
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', new Schema({}, { strict: false }));
const Config = mongoose.models.Config || mongoose.model('Config', new Schema({}, { strict: false }));
const Banner = mongoose.models.Banner || mongoose.model('Banner', new Schema({}, { strict: false }));

// --- GENERIC CRUD HELPERS ---
const getAll = (Model) => async (req, res) => {
    try { const items = await Model.find(); res.json(items); } 
    catch (e) { res.status(500).json({ error: e.message }); }
};
const createOne = (Model) => async (req, res) => {
    try { const item = await Model.create(req.body); res.json(item); } 
    catch (e) { res.status(500).json({ error: e.message }); }
};
const deleteOne = (Model) => async (req, res) => {
    try { await Model.deleteOne({ id: req.params.id }); res.json({ message: 'Deleted' }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
};
const updateOne = (Model) => async (req, res) => {
    try { 
        const item = await Model.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }); 
        res.json(item); 
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// --- PRODUCTS ---
app.get('/api/products', getAll(Product));
app.post('/api/products', createOne(Product));
app.put('/api/products/:id', updateOne(Product));
app.delete('/api/products/:id', deleteOne(Product));

// --- CATEGORIES ---
app.get('/api/categories', getAll(Category));
app.post('/api/categories', createOne(Category));
app.delete('/api/categories/:id', deleteOne(Category));

// --- REVIEWS ---
app.get('/api/reviews', getAll(Review));
app.post('/api/reviews', createOne(Review));
app.delete('/api/reviews/:id', deleteOne(Review));

// --- COUPONS ---
app.get('/api/coupons', getAll(Coupon));
app.post('/api/coupons', createOne(Coupon));
app.delete('/api/coupons/:id', deleteOne(Coupon));

// --- BANNERS ---
app.get('/api/banners', getAll(Banner));
app.post('/api/banners', createOne(Banner));
app.put('/api/banners/:id', updateOne(Banner));
app.delete('/api/banners/:id', deleteOne(Banner));

// --- ORDERS ---
app.get('/api/orders', getAll(Order));
app.post('/api/orders', createOne(Order));
app.put('/api/orders/:id', updateOne(Order));

// --- CONFIG ---
app.get('/api/config', async (req, res) => {
    try {
        const config = await Config.findOne();
        res.json(config || {});
    } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/config', async (req, res) => {
    try {
        const config = await Config.findOneAndUpdate({}, req.body, { upsert: true, new: true });
        res.json(config);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});