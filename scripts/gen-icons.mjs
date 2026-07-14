import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

// Ícono: fondo rosa con una florecita blanca (formas puras -> rasteriza bien).
function svg(size, pad) {
  const c = size / 2;
  const petalR = size * 0.14;
  const dist = size * 0.17;
  const petals = [0, 60, 120, 180, 240, 300]
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      const px = c + Math.cos(a) * dist;
      const py = c + Math.sin(a) * dist;
      return `<circle cx="${px}" cy="${py}" r="${petalR}" fill="#ffffff" opacity="0.95"/>`;
    })
    .join("");
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${pad}" fill="#f43f5e"/>
  ${petals}
  <circle cx="${c}" cy="${c}" r="${size * 0.11}" fill="#fde68a"/>
</svg>`);
}

async function main() {
  const targets = [
    { name: "icon-192.png", size: 192, radius: 40 },
    { name: "icon-512.png", size: 512, radius: 110 },
    { name: "icon-512-maskable.png", size: 512, radius: 0 },
    { name: "apple-touch-icon.png", size: 180, radius: 0 },
  ];
  for (const t of targets) {
    await sharp(svg(t.size, t.radius))
      .png()
      .toFile(join(publicDir, t.name));
    console.log("ok:", t.name);
  }
}

main();
