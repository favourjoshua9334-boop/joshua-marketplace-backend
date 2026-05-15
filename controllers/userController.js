import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'joshuaMarketplaceSecret';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, '../data/users.json');

async function readUsers() {
  const fileContents = await fs.readFile(usersFilePath, 'utf8');
  return JSON.parse(fileContents || '[]');
}

async function writeUsers(users) {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function sanitizeUser(user) {
  const { password, ...safeData } = user;
  return safeData;
}

// ============================================
// REGISTER - Create a new user account
// ============================================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const users = await readUsers();
    const emailExists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      isAdmin: false,
    };

    users.push(newUser);
    await writeUsers(users);

    const token = createToken({ userId: newUser.id, email: newUser.email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// ============================================
// LOGIN - Authenticate user and get JWT token
// ============================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const users = await readUsers();
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = createToken({ userId: user.id, email: user.email });

    res.json({
      success: true,
      message: 'Login successful',
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// ============================================
// GET ALL USERS - Retrieve all users from database
// ============================================
export const getAllUsers = async (req, res) => {
  try {
    const users = await readUsers();
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      count: users.length,
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message,
    });
  }
};

// ============================================
// GET USER BY ID - Retrieve a single user by ID
// ============================================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readUsers();
    const user = users.find((item) => item.id === id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message,
    });
  }
};
