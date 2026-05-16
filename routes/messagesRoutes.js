import express from 'express';
import { sendMessage, getMessages, markRead } from '../controllers/messagesController.js';
import { verifyToken, loadUser } from '../middleware/auth.js';

const router = express.Router();
router.post('/send', verifyToken, loadUser, sendMessage);
router.get('/', verifyToken, loadUser, getMessages);
router.put('/:id/read', verifyToken, loadUser, markRead);

export default router;
