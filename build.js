import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Assets to copy into public output directory
const filesToCopy = [
  'index.html',
  'style.css',
  'script.js',
  'animations.css',
  'animations.js',
  'blurhash-client.js',
  'default-cover.svg',
  'wildbugs-logo.png'
];

for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(publicDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} -> public/${file}`);
  }
}

console.log('Build completed successfully. Output directory "public" prepared.');
