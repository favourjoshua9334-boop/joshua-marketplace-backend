import { readJSON, writeJSON } from '../utils/db.js';

async function getFavorites(req, res) {
  const user = req.currentUser || req.user;
  const favs = await readJSON('favorites.json');
  const mine = favs.filter(f => f.userId === user.id).map(f => f.productId);
  res.json(mine);
}

async function addFavorite(req, res) {
  const user = req.currentUser || req.user;
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });
  const favs = await readJSON('favorites.json');
  if (!favs.find(f => f.userId === user.id && f.productId === productId)) {
    favs.push({ id: Date.now().toString(), userId: user.id, productId });
    await writeJSON('favorites.json', favs);
  }
  res.json({ message: 'Added' });
}

async function removeFavorite(req, res) {
  const user = req.currentUser || req.user;
  const { productId } = req.params;
  let favs = await readJSON('favorites.json');
  favs = favs.filter(f => !(f.userId === user.id && f.productId === productId));
  await writeJSON('favorites.json', favs);
  res.json({ message: 'Removed' });
}

export { getFavorites, addFavorite, removeFavorite };
