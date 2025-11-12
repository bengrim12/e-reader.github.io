import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputHar = "./input.har";
const outputDir = "./public/images";

async function main() {
  const har = JSON.parse(fs.readFileSync(inputHar, "utf8"));
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  let count = 0;
  for (const entry of har.log.entries) {
    const { response } = entry;
    const content = response?.content;
    if (!content?.mimeType?.startsWith("image/") || !content?.text) continue;

    const base64 = content.text;
    const buffer = Buffer.from(base64, "base64");
    const ext = content.mimeType.split("/")[1];
    const outPath = path.join(outputDir, `image_${count}.${ext}`);

    await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .toFile(outPath);

    console.log(`→ ${outPath}`);
    count++;
  }

  console.log(`Fertig: ${count} Bilder verarbeitet.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
