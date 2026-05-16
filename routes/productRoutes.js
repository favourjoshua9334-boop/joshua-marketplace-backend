import express from 'express';
import { createProduct, getProducts, getPendingProducts, getProductById, updateProduct, deleteProduct, approveProduct, rejectProduct, getMyProducts } from '../controllers/productController.js';
import { verifyToken, loadUser } from '../middleware/auth.js';
import { isAdmin, isSeller, isVerified } from '../middleware/roles.js';

const router = express.Router();

router.post('/', verifyToken, loadUser, isSeller, isVerified, createProduct);
router.get('/', getProducts);
router.get('/pending', verifyToken, loadUser, isAdmin, getPendingProducts);
router.get('/my', verifyToken, loadUser, getMyProducts);
router.get('/:id', getProductById);
router.put('/:id', verifyToken, loadUser, updateProduct);
router.delete('/:id', verifyToken, loadUser, deleteProduct);
router.put('/:id/approve', verifyToken, loadUser, isAdmin, approveProduct);
router.put('/:id/reject', verifyToken, loadUser, isAdmin, rejectProduct);

export default router;
