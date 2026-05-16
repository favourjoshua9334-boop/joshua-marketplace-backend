import express from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoritesController.js';
import { verifyToken, loadUser } from '../middleware/auth.js';

const router = express.Router();
router.get('/', verifyToken, loadUser, getFavorites);
router.post('/add', verifyToken, loadUser, addFavorite);
router.delete('/remove/:productId', verifyToken, loadUser, removeFavorite);

export default router;
