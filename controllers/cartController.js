import { readJSON, writeJSON } from '../utils/db.js';

async function getCart(req, res) {
  const user = req.currentUser || req.user;
  const carts = await readJSON('carts.json');
  const cart = carts.find(c => c.userId === user.id) || { userId: user.id, items: [] };
  res.json(cart);
}

async function addToCart(req, res) {
  const user = req.currentUser || req.user;
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });
  const carts = await readJSON('carts.json');
  let cart = carts.find(c => c.userId === user.id);
  if (!cart) { cart = { userId: user.id, items: [] }; carts.push(cart); }
  const item = cart.items.find(i => i.productId === productId);
  if (item) item.quantity += Number(quantity); else cart.items.push({ id: Date.now().toString(), productId, quantity: Number(quantity) });
  await writeJSON('carts.json', carts);
  res.json({ message: 'Added', cart });
}

async function updateCart(req, res) {
  const user = req.currentUser || req.user;
  const { itemId, quantity } = req.body;
  if (!itemId) return res.status(400).json({ error: 'itemId required' });
  const carts = await readJSON('carts.json');
  const cart = carts.find(c => c.userId === user.id);
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  const item = cart.items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  item.quantity = Number(quantity) > 0 ? Number(quantity) : item.quantity;
  await writeJSON('carts.json', carts);
  res.json({ message: 'Updated', cart });
}

async function removeFromCart(req, res) {
  const user = req.currentUser || req.user;
  const { itemId } = req.params;
  const carts = await readJSON('carts.json');
  const cart = carts.find(c => c.userId === user.id);
  if (!cart) return res.status(404).json({ error: 'Cart not found' });
  cart.items = cart.items.filter(i => i.id !== itemId);
  await writeJSON('carts.json', carts);
  res.json({ message: 'Removed', cart });
}

async function clearCart(req, res) {
  const user = req.currentUser || req.user;
  let carts = await readJSON('carts.json');
  carts = carts.filter(c => c.userId !== user.id);
  await writeJSON('carts.json', carts);
  res.json({ message: 'Cleared' });
}

export { getCart, addToCart, updateCart, removeFromCart, clearCart };
