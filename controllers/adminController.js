import { readJSON, writeJSON } from '../utils/db.js';

async function getAllUsers(req, res) {
  const users = await readJSON('users.json');
  const { page, limit } = req.query;
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 20;
  const start = (p - 1) * l;
  res.json({ data: users.slice(start, start + l), page: p, limit: l, total: users.length });
}

async function banUser(req, res) {
  const { id } = req.params;
  const users = await readJSON('users.json');
  const u = users.find(x => x.id === id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  u.banned = true;
  await writeJSON('users.json', users);
  res.json({ message: 'Banned' });
}

async function unbanUser(req, res) {
  const { id } = req.params;
  const users = await readJSON('users.json');
  const u = users.find(x => x.id === id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  u.banned = false;
  await writeJSON('users.json', users);
  res.json({ message: 'Unbanned' });
}

async function getStats(req, res) {
  const users = await readJSON('users.json');
  const products = await readJSON('products.json');
  const orders = await readJSON('orders.json');
  res.json({ users: users.length, products: products.length, orders: orders.length });
}

async function getPendingProducts(req, res) {
  const products = await readJSON('products.json');
  res.json(products.filter(x => x.status === 'pending'));
}

async function getPendingVerifications(req, res) {
  const ver = await readJSON('verifications.json');
  res.json(ver.filter(x => x.status === 'pending'));
}

export { getAllUsers, banUser, unbanUser, getStats, getPendingProducts, getPendingVerifications };
