import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, getSellerOrders } from '../controllers/orderController.js';
import { verifyToken, loadUser } from '../middleware/auth.js';

const router = express.Router();
router.post('/create', verifyToken, loadUser, createOrder);
router.get('/', verifyToken, loadUser, getOrders);
router.get('/:id', verifyToken, loadUser, getOrderById);
router.put('/:id/status', verifyToken, loadUser, updateOrderStatus);
router.get('/seller', verifyToken, loadUser, getSellerOrders);

export default router;
