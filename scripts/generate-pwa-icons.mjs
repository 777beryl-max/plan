import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(__dirname, "../public/images/Bullet Plan_app logo.png");
const publicIconsDir = path.join(__dirname, "../public/icons");
const appDir = path.join(__dirname, "../app");

const outputs = [
  { path: path.join(publicIconsDir, "icon-192x192.png"), size: 192 },
  { path: path.join(publicIconsDir, "icon-512x512.png"), size: 512 },
  { path: path.join(publicIconsDir, "apple-touch-icon.png"), size: 180 },
  { path: path.join(appDir, "icon.png"), size: 512 },
  { path: path.join(appDir, "apple-icon.png"), size: 180 },
];

for (const { path: outputPath, size } of outputs) {
  await sharp(source)
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
  console.log(`Generated ${path.relative(path.join(__dirname, ".."), outputPath)}`);
}
