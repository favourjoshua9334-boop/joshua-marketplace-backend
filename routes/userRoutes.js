import express from 'express';
import {
  register,
  login,
  getAllUsers,
  getUserById,
} from '../controllers/userController.js';

const router = express.Router();

// POST /api/users/register - Create a new user
router.post('/register', register);

// POST /api/users/login - Authenticate user and get JWT token
router.post('/login', login);

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get a single user by ID
router.get('/:id', getUserById);

export default router;
