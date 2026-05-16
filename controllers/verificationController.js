import { readJSON, writeJSON } from '../utils/db.js';
import { sendEmailSimulation } from '../utils/email.js';

async function submitVerification(req, res) {
  const user = req.currentUser || req.user;
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  const { idDocumentBase64, addressProofBase64 } = req.body;
  if (!idDocumentBase64 || !addressProofBase64) return res.status(400).json({ error: 'Missing documents' });
  const list = await readJSON('verifications.json');
  const entry = {
    id: Date.now().toString(),
    userId: user.id,
    idDocumentBase64,
    addressProofBase64,
    status: 'pending',
    reason: null,
    createdAt: new Date().toISOString()
  };
  list.push(entry);
  await writeJSON('verifications.json', list);
  sendEmailSimulation(user.email, 'Verification submitted', 'Your verification was submitted and is pending review');
  res.status(201).json({ message: 'Submitted', verificationId: entry.id });
}

async function verificationStatus(req, res) {
  const user = req.currentUser || req.user;
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  const list = await readJSON('verifications.json');
  const v = list.filter(x => x.userId === user.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0];
  if (!v) return res.json({ status: 'none' });
  res.json({ status: v.status, reason: v.reason || null });
}

async function adminUpdateVerification(req, res) {
  const { userId } = req.params;
  const { action, reason } = req.body; // action: approve|reject
  const list = await readJSON('verifications.json');
  const v = list.find(x => x.userId === userId && x.status === 'pending');
  if (!v) return res.status(404).json({ error: 'Pending verification not found' });
  if (action === 'approve') {
    v.status = 'approved';
    // update user
    const users = await readJSON('users.json');
    const u = users.find(x => x.id === userId);
    if (u) {
      u.verified = true;
      await writeJSON('users.json', users);
    }
    await writeJSON('verifications.json', list);
    sendEmailSimulation(u.email, 'Verification approved', 'Your seller verification was approved');
    return res.json({ message: 'Approved' });
  } else {
    v.status = 'rejected';
    v.reason = reason || 'Rejected by admin';
    await writeJSON('verifications.json', list);
    const users = await readJSON('users.json');
    const u = users.find(x => x.id === userId);
    if (u) sendEmailSimulation(u.email, 'Verification rejected', `Reason: ${v.reason}`);
    return res.json({ message: 'Rejected' });
  }
}

async function adminListPending(req, res) {
  const list = await readJSON('verifications.json');
  const pending = list.filter(x => x.status === 'pending');
  res.json(pending);
}

export { submitVerification, verificationStatus, adminUpdateVerification, adminListPending };
