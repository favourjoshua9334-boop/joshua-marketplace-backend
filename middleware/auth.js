import jwt from 'jsonwebtoken';
import { readJSON } from '../utils/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const JWT_SECRET = process.env.JWT_SECRET || 'joshuaMarketplaceSecret';

async function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // attach user to req
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function loadUser(req, res, next) {
  if (!req.user) return next();
  try {
    const users = await readJSON('users.json');
    const u = users.find(x => x.id === req.user.id);
    req.currentUser = u || null;
    return next();
  } catch (err) {
    return next();
  }
}

export { verifyToken, loadUser };
