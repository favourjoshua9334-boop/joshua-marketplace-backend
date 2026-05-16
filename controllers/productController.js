import { readJSON, writeJSON } from '../utils/db.js';

function paginate(items, page = 1, limit = 10) {
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 10;
  const start = (p - 1) * l;
  return { data: items.slice(start, start + l), page: p, limit: l, total: items.length };
}

async function createProduct(req, res) {
  const user = req.currentUser || req.user;
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (user.role !== 'seller' || !user.verified) return res.status(403).json({ error: 'Verified seller required' });
  const { title, description, price, images = [], category } = req.body;
  if (!title || !price) return res.status(400).json({ error: 'Missing fields' });
  const products = await readJSON('products.json');
  const p = {
    id: Date.now().toString(),
    sellerId: user.id,
    title,
    description: description || '',
    price: Number(price),
    images,
    category: category || 'Uncategorized',
    status: 'pending',
    rejectionReason: null,
    createdAt: new Date().toISOString()
  };
  products.push(p);
  await writeJSON('products.json', products);
  res.status(201).json({ message: 'Product created', product: p });
}

async function getProducts(req, res) {
  const { q, category, minPrice, maxPrice, page, limit } = req.query;
  let products = await readJSON('products.json');
  products = products.filter(p => p.status === 'approved');
  if (q) products = products.filter(p => p.title.toLowerCase().includes(q.toLowerCase()));
  if (category) products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (minPrice) products = products.filter(p => p.price >= Number(minPrice));
  if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice));
  const result = paginate(products, page, limit);
  res.json(result);
}

async function getPendingProducts(req, res) {
  const products = await readJSON('products.json');
  const pending = products.filter(p => p.status === 'pending');
  res.json(pending);
}

async function getProductById(req, res) {
  const { id } = req.params;
  const products = await readJSON('products.json');
  const p = products.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
}

async function updateProduct(req, res) {
  const user = req.currentUser || req.user;
  const { id } = req.params;
  const products = await readJSON('products.json');
  const p = products.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  if (p.sellerId !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Not allowed' });
  const { title, description, price, images, category } = req.body;
  if (title) p.title = title;
  if (description) p.description = description;
  if (price) p.price = Number(price);
  if (images) p.images = images;
  if (category) p.category = category;
  p.status = 'pending';
  p.rejectionReason = null;
  await writeJSON('products.json', products);
  res.json({ message: 'Updated', product: p });
}

async function deleteProduct(req, res) {
  const user = req.currentUser || req.user;
  const { id } = req.params;
  let products = await readJSON('products.json');
  const p = products.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  if (p.sellerId !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Not allowed' });
  products = products.filter(x => x.id !== id);
  await writeJSON('products.json', products);
  res.json({ message: 'Deleted' });
}

async function approveProduct(req, res) {
  const { id } = req.params;
  const products = await readJSON('products.json');
  const p = products.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  p.status = 'approved';
  p.rejectionReason = null;
  await writeJSON('products.json', products);
  res.json({ message: 'Approved' });
}

async function rejectProduct(req, res) {
  const { id } = req.params;
  const { reason } = req.body;
  const products = await readJSON('products.json');
  const p = products.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  p.status = 'rejected';
  p.rejectionReason = reason || 'Rejected by admin';
  await writeJSON('products.json', products);
  res.json({ message: 'Rejected' });
}

async function getMyProducts(req, res) {
  const user = req.currentUser || req.user;
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  const products = await readJSON('products.json');
  const my = products.filter(p => p.sellerId === user.id);
  res.json(my);
}

export { createProduct, getProducts, getPendingProducts, getProductById, updateProduct, deleteProduct, approveProduct, rejectProduct, getMyProducts };
