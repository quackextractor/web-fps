/* eslint-disable */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const TEXTURES_DIR = path.join(__dirname, '../public/textures');
const files = fs.readdirSync(TEXTURES_DIR).filter(f => f.endsWith('.bmp'));

/**
 * Parse a 24-bit Windows BMP file into raw RGB pixel data.
 * Sharp does not natively support BMP, so we parse the header manually.
 */
function bmpToRawPixels(bmpPath) {
  const buf = fs.readFileSync(bmpPath);
  const dataOffset = buf.readUInt32LE(10);
  const width = buf.readInt32LE(18);
  const height = buf.readInt32LE(22);
  const bitsPerPixel = buf.readUInt16LE(28);

  // Row size padded to 4-byte boundary
  const rowSize = Math.floor((bitsPerPixel * width + 31) / 32) * 4;
  const pixels = Buffer.alloc(width * height * 3);

  for (let row = 0; row < height; row++) {
    const srcRow = height - 1 - row; // BMP rows are stored bottom-up
    for (let col = 0; col < width; col++) {
      const srcIdx = dataOffset + srcRow * rowSize + col * 3;
      const dstIdx = (row * width + col) * 3;
      // BMP channels are BGR; convert to RGB
      pixels[dstIdx] = buf[srcIdx + 2]; // R
      pixels[dstIdx + 1] = buf[srcIdx + 1]; // G
      pixels[dstIdx + 2] = buf[srcIdx]; // B
    }
  }

  return { pixels, width, height };
}

async function convert() {
  for (const file of files) {
    const src = path.join(TEXTURES_DIR, file);
    const dest = path.join(TEXTURES_DIR, file.replace('.bmp', '.webp'));
    const { pixels, width, height } = bmpToRawPixels(src);
    await sharp(pixels, { raw: { width, height, channels: 3 } })
      .webp({ lossless: true })
      .toFile(dest);
    console.log(`Converted ${file} -> ${file.replace('.bmp', '.webp')}`);
  }
}

convert().catch(console.error);
