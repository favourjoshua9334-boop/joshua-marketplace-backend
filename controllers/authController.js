import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readJSON, writeJSON, ensureDataFile } from '../utils/db.js';
import { sendEmailSimulation } from '../utils/email.js';

const JWT_SECRET = process.env.JWT_SECRET || 'joshuaMarketplaceSecret';

async function register(req, res) {
  const { name, email, password, userType, businessWhatsApp, businessAddress } = req.body;
  if (!name || !email || !password || !userType) return res.status(400).json({ error: 'Missing fields' });
  const users = await readJSON('users.json');
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ') || '';
  const newUser = {
    id: Date.now().toString(),
    name,
    firstName,
    lastName,
    email: email.toLowerCase(),
    password: hashed,
    role: userType === 'seller' ? 'seller' : 'buyer',
    verified: false,
    banned: false,
    businessWhatsApp: businessWhatsApp || '',
    businessAddress: businessAddress || '',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  await writeJSON('users.json', users);
  sendEmailSimulation(newUser.email, 'Welcome to Joshua Marketplace', `Hi ${newUser.name}, welcome!`);
  res.status(201).json({ message: 'Registered', user: {
    id: newUser.id,
    name: newUser.name,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    role: newUser.role,
    verified: newUser.verified,
    businessWhatsApp: newUser.businessWhatsApp,
    businessAddress: newUser.businessAddress
  } });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  const users = await readJSON('users.json');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.banned) return res.status(403).json({ error: 'User is banned' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: {
    id: user.id,
    name: user.name,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    role: user.role,
    verified: user.verified,
    businessWhatsApp: user.businessWhatsApp || '',
    businessAddress: user.businessAddress || ''
  } });
}

async function me(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const users = await readJSON('users.json');
    const user = users.find(u => u.id === payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user.id, name: user.name, firstName: user.firstName || '', lastName: user.lastName || '', email: user.email, role: user.role, verified: user.verified, businessWhatsApp: user.businessWhatsApp || '', businessAddress: user.businessAddress || '' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function updateProfile(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const users = await readJSON('users.json');
    const user = users.find(u => u.id === payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, firstName, lastName, businessWhatsApp, businessAddress } = req.body;
    if (name) {
      user.name = name;
      const [first, ...rest] = name.trim().split(' ');
      user.firstName = first;
      user.lastName = rest.join(' ');
    }
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (businessWhatsApp !== undefined) user.businessWhatsApp = businessWhatsApp;
    if (businessAddress !== undefined) user.businessAddress = businessAddress;

    await writeJSON('users.json', users);
    res.json({ id: user.id, name: user.name, firstName: user.firstName || '', lastName: user.lastName || '', email: user.email, role: user.role, verified: user.verified, businessWhatsApp: user.businessWhatsApp || '', businessAddress: user.businessAddress || '' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function logout(req, res) {
  // With JWT stateless, client should remove token. We'll respond OK.
  res.json({ message: 'Logged out' });
}

export { register, login, me, updateProfile, logout };
