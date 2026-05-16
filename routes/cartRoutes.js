import express from 'express';
import { getCart, addToCart, updateCart, removeFromCart, clearCart } from '../controllers/cartController.js';
import { verifyToken, loadUser } from '../middleware/auth.js';

const router = express.Router();
router.get('/', verifyToken, loadUser, getCart);
router.post('/add', verifyToken, loadUser, addToCart);
router.put('/update', verifyToken, loadUser, updateCart);
router.delete('/remove/:itemId', verifyToken, loadUser, removeFromCart);
router.delete('/clear', verifyToken, loadUser, clearCart);

export default router;
