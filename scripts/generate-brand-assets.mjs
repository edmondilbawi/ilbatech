import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const sourcePath = process.argv[2];

if (!sourcePath) {
  throw new Error("Usage: node scripts/generate-brand-assets.mjs <square-master-image>");
}

const root = resolve(import.meta.dirname, "..");
const publicDir = resolve(root, "public");
const appDir = resolve(root, "src", "app");

await mkdir(publicDir, { recursive: true });
await mkdir(appDir, { recursive: true });

const master = sharp(resolve(sourcePath)).resize(1024, 1024, {
  fit: "cover",
  position: "centre",
});

await master.clone().png({ compressionLevel: 9 }).toFile(resolve(publicDir, "brand-mark.png"));
await master.clone().resize(512, 512).webp({ quality: 90 }).toFile(resolve(publicDir, "brand-mark.webp"));

const faviconSizes = [16, 32, 48];
const faviconPngs = await Promise.all(
  faviconSizes.map((size) =>
    master.clone().resize(size, size).png({ compressionLevel: 9 }).toBuffer(),
  ),
);

await writeFile(resolve(publicDir, "favicon-16x16.png"), faviconPngs[0]);
await writeFile(resolve(publicDir, "favicon-32x32.png"), faviconPngs[1]);
await writeFile(resolve(publicDir, "favicon.ico"), createIco(faviconPngs, faviconSizes));

const appleIcon = await master.clone().resize(180, 180).png({ compressionLevel: 9 }).toBuffer();
await writeFile(resolve(publicDir, "apple-touch-icon.png"), appleIcon);
await writeFile(resolve(appDir, "apple-icon.png"), appleIcon);

const ogMark = await master.clone().resize(160, 160).png({ compressionLevel: 9 }).toBuffer();
const ogLayout = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#F5F1E6"/>
    <circle cx="1050" cy="90" r="220" fill="#DDE9DF"/>
    <text x="290" y="218" fill="#0F3D2E" font-family="Arial, sans-serif" font-size="64" font-weight="800" letter-spacing="14">ILBATECH</text>
    <path d="M92 316h78" stroke="#C8A15A" stroke-width="6"/>
    <text x="91" y="407" fill="#0F3D2E" font-family="Georgia, serif" font-size="59">Digital solutions built</text>
    <text x="91" y="480" fill="#0F3D2E" font-family="Georgia, serif" font-size="59">around your business.</text>
    <text x="91" y="548" fill="#557066" font-family="Arial, sans-serif" font-size="25">Websites | Business systems | Mobile apps | AI automation</text>
  </svg>
`);

await sharp(ogLayout)
  .composite([{ input: ogMark, left: 91, top: 78 }])
  .png({ compressionLevel: 9 })
  .toFile(resolve(publicDir, "og-image.png"));

function createIco(images, sizes) {
  const directorySize = 6 + images.length * 16;
  const header = Buffer.alloc(directorySize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = directorySize;
  images.forEach((image, index) => {
    const entry = 6 + index * 16;
    const size = sizes[index];
    header.writeUInt8(size === 256 ? 0 : size, entry);
    header.writeUInt8(size === 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });

  return Buffer.concat([header, ...images]);
}
