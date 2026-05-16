import { readJSON, writeJSON } from '../utils/db.js';

async function createOrder(req, res) {
  const user = req.currentUser || req.user;
  const carts = await readJSON('carts.json');
  const products = await readJSON('products.json');
  const cart = carts.find(c => c.userId === user.id);
  if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'Cart empty' });
  const items = cart.items.map(i => {
    const p = products.find(x => x.id === i.productId);
    return { productId: i.productId, title: p?.title || 'Unknown', price: p?.price || 0, quantity: i.quantity, sellerId: p?.sellerId || null };
  });
  const orders = await readJSON('orders.json');
  const order = { id: Date.now().toString(), userId: user.id, items, status: 'created', total: items.reduce((s,it)=>s+it.price*it.quantity,0), createdAt: new Date().toISOString() };
  orders.push(order);
  await writeJSON('orders.json', orders);
  // clear cart
  const newCarts = carts.filter(c => c.userId !== user.id);
  await writeJSON('carts.json', newCarts);
  res.status(201).json({ message: 'Order created', order });
}

async function getOrders(req, res) {
  const user = req.currentUser || req.user;
  const orders = await readJSON('orders.json');
  if (user.role === 'seller') {
    // seller: return orders containing their products
    const sellerOrders = orders.filter(o => o.items.some(i => i.sellerId === user.id));
    return res.json(sellerOrders);
  }
  // buyer: return their orders
  res.json(orders.filter(o => o.userId === user.id));
}

async function getOrderById(req, res) {
  const user = req.currentUser || req.user;
  const { id } = req.params;
  const orders = await readJSON('orders.json');
  const o = orders.find(x => x.id === id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  if (user.role === 'seller') {
    if (!o.items.some(i => i.sellerId === user.id)) return res.status(403).json({ error: 'Not allowed' });
  } else {
    if (o.userId !== user.id) return res.status(403).json({ error: 'Not allowed' });
  }
  res.json(o);
}

async function updateOrderStatus(req, res) {
  const user = req.currentUser || req.user;
  const { id } = req.params;
  const { status } = req.body; // e.g., shipped, delivered, cancelled
  const orders = await readJSON('orders.json');
  const o = orders.find(x => x.id === id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  // only seller for their orders or admin
  if (user.role === 'seller') {
    if (!o.items.some(i => i.sellerId === user.id)) return res.status(403).json({ error: 'Not allowed' });
  }
  o.status = status || o.status;
  await writeJSON('orders.json', orders);
  res.json({ message: 'Updated', order: o });
}

async function getSellerOrders(req, res) {
  const user = req.currentUser || req.user;
  if (user.role !== 'seller') return res.status(403).json({ error: 'Seller required' });
  const orders = await readJSON('orders.json');
  const sellerOrders = orders.filter(o => o.items.some(i => i.sellerId === user.id));
  res.json(sellerOrders);
}

export { createOrder, getOrders, getOrderById, updateOrderStatus, getSellerOrders };
