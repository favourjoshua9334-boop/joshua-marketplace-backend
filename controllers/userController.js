import { readJSON } from '../utils/db.js';

async function getAllUsers(req, res) {
  const users = await readJSON('users.json');
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, verified: u.verified })));
}

async function getUserById(req, res) {
  const { id } = req.params;
  const users = await readJSON('users.json');
  const u = users.find(x => x.id === id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json({ id: u.id, name: u.name, email: u.email, role: u.role, verified: u.verified });
}

export { getAllUsers, getUserById };
