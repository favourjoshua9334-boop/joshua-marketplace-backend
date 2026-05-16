import { readJSON, writeJSON } from '../utils/db.js';

async function sendMessage(req, res) {
  const user = req.currentUser || req.user;
  const { toUserId, subject, content } = req.body;
  if (!toUserId || !content) return res.status(400).json({ error: 'Missing fields' });
  const messages = await readJSON('messages.json');
  const m = { id: Date.now().toString(), from: user.id, to: toUserId, subject: subject || '', content, read: false, createdAt: new Date().toISOString() };
  messages.push(m);
  await writeJSON('messages.json', messages);
  res.json({ message: 'Sent' });
}

async function getMessages(req, res) {
  const user = req.currentUser || req.user;
  const messages = await readJSON('messages.json');
  const mine = messages.filter(m => m.to === user.id || m.from === user.id);
  res.json(mine);
}

async function markRead(req, res) {
  const user = req.currentUser || req.user;
  const { id } = req.params;
  const messages = await readJSON('messages.json');
  const m = messages.find(x => x.id === id && x.to === user.id);
  if (!m) return res.status(404).json({ error: 'Message not found' });
  m.read = true;
  await writeJSON('messages.json', messages);
  res.json({ message: 'Marked as read' });
}

export { sendMessage, getMessages, markRead };
