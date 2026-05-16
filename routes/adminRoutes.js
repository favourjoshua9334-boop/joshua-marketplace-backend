import express from 'express';
import { getAllUsers, banUser, unbanUser, getStats, getPendingProducts, getPendingVerifications } from '../controllers/adminController.js';
import { verifyToken, loadUser } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';

const router = express.Router();
router.get('/users', verifyToken, loadUser, isAdmin, getAllUsers);
router.put('/users/:id/ban', verifyToken, loadUser, isAdmin, banUser);
router.put('/users/:id/unban', verifyToken, loadUser, isAdmin, unbanUser);
router.get('/stats', verifyToken, loadUser, isAdmin, getStats);
router.get('/pending-products', verifyToken, loadUser, isAdmin, getPendingProducts);
router.get('/pending-verifications', verifyToken, loadUser, isAdmin, getPendingVerifications);

export default router;
