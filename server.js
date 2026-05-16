// ============================================
// IMPORTS - All required dependencies
// ============================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import messagesRoutes from './routes/messagesRoutes.js';
import { ensureDataFile } from './utils/db.js';

// Load environment variables from .env file
dotenv.config();

// ============================================
// CONFIGURATION - Server and environment setup
// ============================================
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'joshuaMarketplaceSecret';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFolder = path.join(__dirname, 'data');
const usersFilePath = path.join(dataFolder, 'users.json');

// ============================================
// MIDDLEWARE - Express configuration
// ============================================
// Parse incoming JSON requests
app.use(express.json());

// Enable CORS for all origins
app.use(cors());

// ============================================
// INITIALIZE JSON DATABASE FILE
// ============================================
async function ensureJsonDatabase() {
  try {
    await fs.mkdir(dataFolder, { recursive: true });
    const exists = await fs.stat(usersFilePath).then(() => true).catch(() => false);
    if (!exists) {
      await fs.writeFile(usersFilePath, '[]', 'utf8');
      console.log('✅ Created JSON database file at:', usersFilePath);
    }
    // ensure other JSON templates exist
    await ensureDataFile('products.json');
    await ensureDataFile('verifications.json');
    await ensureDataFile('carts.json');
    await ensureDataFile('orders.json');
    await ensureDataFile('favorites.json');
    await ensureDataFile('messages.json');
  } catch (error) {
    console.error('❌ Failed to initialize JSON database:', error.message);
    process.exit(1);
  }
}

// ============================================
// ROUTES - API endpoints
// ============================================

// Health check - Verify backend is running
app.get('/', (req, res) => {
  res.json({ message: 'Joshua Marketplace Backend is running' });
});

// Test route - Simple endpoint to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Marketplace backend running' });
});

// Import and use user routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messagesRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler - Catches and handles all server errors
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({ error: 'Server error' });
});

// ============================================
// SERVER STARTUP
// ============================================

// Start the server after JSON database is ready
async function startServer() {
  try {
    await ensureJsonDatabase();

    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('🚀 Backend server is running');
      console.log('═══════════════════════════════════════════════');
      console.log(`📍 API base URL: http://localhost:${PORT}`);
      console.log('✅ JSON database ready');
      console.log('📚 Available routes:');
      console.log('   GET  / - Health check');
      console.log('   GET  /api/test - Test endpoint');
      console.log('   POST /api/users/register - Register new user');
      console.log('   POST /api/users/login - Login user');
      console.log('   GET  /api/users - Get all users');
      console.log('   GET  /api/users/:id - Get single user');
      console.log('═══════════════════════════════════════════════');
      console.log('');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
