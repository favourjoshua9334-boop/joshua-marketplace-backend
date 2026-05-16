import express from 'express';
import { submitVerification, verificationStatus, adminUpdateVerification, adminListPending } from '../controllers/verificationController.js';
import { verifyToken, loadUser } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';

const router = express.Router();
router.post('/submit', verifyToken, loadUser, submitVerification);
router.get('/status', verifyToken, loadUser, verificationStatus);
router.put('/:userId', verifyToken, loadUser, isAdmin, adminUpdateVerification);
router.get('/pending', verifyToken, loadUser, isAdmin, adminListPending);

export default router;
