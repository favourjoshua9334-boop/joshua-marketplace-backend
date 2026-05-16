import fs from 'fs/promises';
import path from 'path';

const API = 'http://localhost:4000/api';

async function post(path, body, token){
  const res = await fetch(API+path, { method: 'POST', headers: { 'Content-Type':'application/json', ...(token?{Authorization:'Bearer '+token}:{}) }, body: JSON.stringify(body) });
  return res.json();
}
async function get(path, token){
  const res = await fetch(API+path, { headers: { ...(token?{Authorization:'Bearer '+token}:{}) } });
  return res.json();
}
async function put(path, body, token){
  const res = await fetch(API+path, { method: 'PUT', headers: { 'Content-Type':'application/json', ...(token?{Authorization:'Bearer '+token}:{}) }, body: JSON.stringify(body) });
  return res.json();
}

async function run(){
  console.log('Starting smoke test for verification workflow...');
  // Register seller
  const sellerEmail = `seller${Date.now()}@example.com`;
  const sellerReg = await post('/auth/register', { name: 'Test Seller', email: sellerEmail, password: 'pass1234', userType: 'seller' });
  console.log('seller register:', sellerReg);

  // Register admin
  const adminEmail = `admin${Date.now()}@example.com`;
  const adminReg = await post('/auth/register', { name: 'Admin User', email: adminEmail, password: 'adminpass', userType: 'buyer' });
  console.log('admin register:', adminReg);

  // promote admin in users.json
  const usersPath = path.join(process.cwd(), 'data', 'users.json');
  const usersRaw = await fs.readFile(usersPath, 'utf8');
  const users = JSON.parse(usersRaw || '[]');
  const admin = users.find(u => u.email === adminEmail);
  if (admin) { admin.role = 'admin'; await fs.writeFile(usersPath, JSON.stringify(users, null, 2)); console.log('Promoted user to admin'); }

  // login seller
  const sellerLogin = await post('/auth/login', { email: sellerEmail, password: 'pass1234' });
  console.log('seller login:', sellerLogin?.token ? 'OK' : sellerLogin);
  const sellerToken = sellerLogin.token;

  // login admin
  const adminLogin = await post('/auth/login', { email: adminEmail, password: 'adminpass' });
  console.log('admin login:', adminLogin?.token ? 'OK' : adminLogin);
  const adminToken = adminLogin.token;

  // seller submits verification
  const submit = await post('/verification/submit', { idDocumentBase64: 'data:fake', addressProofBase64: 'data:fake' }, sellerToken);
  console.log('submit verification:', submit);

  // admin lists pending
  const pending = await get('/verification/pending', adminToken);
  console.log('pending list count:', Array.isArray(pending) ? pending.length : pending);

  // admin approve
  const sellerUser = users.find(u => u.email === sellerEmail);
  const approve = await put(`/verification/${sellerUser.id}`, { action: 'approve' }, adminToken);
  console.log('approve result:', approve);

  // check seller me
  const me = await get('/auth/me', sellerToken);
  console.log('seller me after approval:', me);

  console.log('Smoke test completed.');
}

run().catch(e=>{ console.error('Smoke test error', e); process.exit(1); });
