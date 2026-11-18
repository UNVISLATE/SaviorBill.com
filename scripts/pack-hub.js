import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';

const hubDir = path.resolve('src/content/hub');
const outputDir = path.resolve('public/downloads/hub');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (fs.existsSync(hubDir)) {
  const entries = fs.readdirSync(hubDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const scriptSlug = entry.name;
      const scriptPath = path.join(hubDir, scriptSlug);
      const zipPath = path.join(outputDir, `${scriptSlug}.zip`);

      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`[PackHub] Packed ${scriptSlug}.zip (${archive.pointer()} bytes)`);
      });

      archive.on('error', (err) => {
        throw err;
      });

      archive.pipe(output);
      archive.directory(scriptPath, false);
      archive.finalize();
    }
  }
} else {
  console.log('[PackHub] No src/content/hub directory found, skipping.');
}
