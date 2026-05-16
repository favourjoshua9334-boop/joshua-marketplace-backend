import express from 'express';
import { register, login, me, updateProfile, logout } from '../controllers/authController.js';
import { verifyToken, loadUser } from '../middleware/auth.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, loadUser, me);
router.put('/update', verifyToken, loadUser, updateProfile);
router.post('/logout', logout);

export default router;
