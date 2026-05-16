function isAdmin(req, res, next) {
  const user = req.currentUser || req.user;
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

function isSeller(req, res, next) {
  const user = req.currentUser || req.user;
  if (!user || user.role !== 'seller') return res.status(403).json({ error: 'Seller access required' });
  next();
}

function isVerified(req, res, next) {
  const user = req.currentUser || req.user;
  if (!user || !user.verified) return res.status(403).json({ error: 'Seller verification required' });
  next();
}

export { isAdmin, isSeller, isVerified };
