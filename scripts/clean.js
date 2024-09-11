import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildDir = __dirname + '/../dist';
for (const file of fs.readdirSync(buildDir)) {
  const path = buildDir + '/' + file;
  const stats = fs.lstatSync(path);
  if (stats.isFile()) {
    fs.unlinkSync(path);
  } else {
    fs.rmdirSync(path, { recursive: true });
  }
}