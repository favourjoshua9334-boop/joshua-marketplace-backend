import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

async function ensureDataFile(name, initial = '[]') {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const filePath = path.join(dataDir, name);
    try {
      await fs.stat(filePath);
    } catch (e) {
      await fs.writeFile(filePath, initial, 'utf8');
    }
    return filePath;
  } catch (err) {
    throw err;
  }
}

async function readJSON(name) {
  const filePath = path.join(dataDir, name);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

async function writeJSON(name, data) {
  const filePath = path.join(dataDir, name);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export { ensureDataFile, readJSON, writeJSON };
