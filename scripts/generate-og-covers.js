import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const blogDir = path.resolve('src/content/blog');
const outDir = path.resolve('public/images/og');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function wrapText(text, maxChars = 28) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 4);
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function generateSvg({ title, tag = 'Architecture', author = 'Andrey UNVI', avatarBase64 = null }) {
  const lines = wrapText(title, 26);
  const textElements = lines
    .map((line, idx) => `<tspan x="80" dy="${idx === 0 ? 0 : 58}">${escapeXml(line)}</tspan>`)
    .join('');

  let avatarMarkup = `
    <circle cx="30" cy="30" r="30" fill="#009080" />
    <text x="30" y="38" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" text-anchor="middle">${escapeXml(author[0] || 'U')}</text>
  `;

  if (avatarBase64) {
    avatarMarkup = `
    <defs>
      <clipPath id="avatarClip">
        <circle cx="30" cy="30" r="30" />
      </clipPath>
    </defs>
    <circle cx="30" cy="30" r="32" fill="#009080" />
    <image href="data:image/jpeg;base64,${avatarBase64}" x="0" y="0" width="60" height="60" clip-path="url(#avatarClip)" />
    `;
  }

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0a0e14" />
      <stop offset="1" stop-color="#121820" />
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1000 150) rotate(135) scale(500)">
      <stop stop-color="#009080" stop-opacity="0.35" />
      <stop offset="1" stop-color="#009080" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#glow)" />
  <rect width="1200" height="630" fill="url(#grid)" />

  <!-- Brand Header -->
  <g transform="translate(80, 80)">
    <svg width="48" height="48" viewBox="0 0 1024 1024" fill="none">
      <path d="M310 433H111L111 652C111 659 111 689 157.001 719L504 948L504 846C504 840 497 827 492 824L221 652C221 652 200 640 200 610V510C200 510 200 500 210.5 500C221 500 221 510 221 510V600C221 630 242 642 242 642L513 814L784 642C784 642 805 630 805 600V220C805 220 805 210 815.5 210C826 210 826 220 826 220V610C826 640 805 652 805 652L534 824C529 827 522 840 522.001 846L522 948L869.001 719C915 689 915 659 915 652V44L746 145C716 163 716 163 716 219.75V549L513.001 696L310 549V433Z" fill="#009080"/>
      <path d="M310.001 342C310.001 312 279 300 244 288C209 276 203 259.5 203 228V102L111 44V411H310.001V342Z" fill="#009080"/>
    </svg>
    <text x="64" y="34" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" letter-spacing="-0.5px">
      Savior<tspan fill="#009080">Bill</tspan>
    </text>
    <rect x="250" y="8" width="130" height="32" rx="16" fill="rgba(0, 144, 128, 0.15)" stroke="#009080" stroke-opacity="0.3" />
    <text x="315" y="29" fill="#00e0cb" font-family="monospace" font-size="14" font-weight="700" text-anchor="middle">#${escapeXml(tag)}</text>
  </g>

  <!-- Title -->
  <text x="80" y="280" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="800" letter-spacing="-1px">
    ${textElements}
  </text>

  <!-- Footer Info -->
  <g transform="translate(80, 500)">
    ${avatarMarkup}
    <text x="80" y="38" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600">${escapeXml(author)}</text>
    <text x="1040" y="38" fill="rgba(255, 255, 255, 0.45)" font-family="monospace" font-size="18" text-anchor="end">saviorbill.com/blog</text>
  </g>
</svg>`;
}

async function getAvatarBase64(avatarRelPath) {
  if (!avatarRelPath) return null;
  const cleanPath = avatarRelPath.startsWith('/') ? avatarRelPath.slice(1) : avatarRelPath;
  const fullPath = path.resolve('public', cleanPath);
  if (!fs.existsSync(fullPath)) return null;

  try {
    const resizedBuffer = await sharp(fullPath)
      .resize(120, 120, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();
    return resizedBuffer.toString('base64');
  } catch (err) {
    console.error(`Failed to process avatar: ${fullPath}`, err);
    return null;
  }
}

async function run() {
  const langs = ['ru', 'en'];
  for (const lang of langs) {
    const dir = path.join(blogDir, lang);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      const slug = file.replace(/\.(md|mdx)$/, '');

      // Parse simple frontmatter
      const titleMatch = content.match(/title:\s*['"]?([^'"\n]+)['"]?/);
      const tagMatch = content.match(/tags:\s*\[([^\]]+)\]/);
      const authorMatch = content.match(/author:\s*['"]?([^'"\n]+)['"]?/);
      const avatarMatch = content.match(/authorAvatar:\s*['"]?([^'"\n]+)['"]?/);

      const title = titleMatch ? titleMatch[1] : slug;
      let tag = 'Engineering';
      if (tagMatch) {
        const firstTag = tagMatch[1].split(',')[0].replace(/['"\s]/g, '');
        if (firstTag) tag = firstTag;
      }
      const author = authorMatch ? authorMatch[1] : 'Andrey UNVI';
      const avatarPath = avatarMatch ? avatarMatch[1] : '/images/avatars/andrey-unvi.jpg';

      const avatarBase64 = await getAvatarBase64(avatarPath);

      const svg = generateSvg({ title, tag, author, avatarBase64 });
      const outPath = path.join(outDir, `${lang}-${slug}.svg`);
      fs.writeFileSync(outPath, svg, 'utf-8');
      console.log(`[AutoOG] Generated: ${outPath} (with avatar: ${!!avatarBase64})`);
    }
  }
}

run();
