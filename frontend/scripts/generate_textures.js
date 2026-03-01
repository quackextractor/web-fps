/* eslint-disable */
const fs = require('fs');
const path = require('path');

const TEXTURE_SIZE = 64;
const OUTPUT_DIR = path.join(__dirname, '../public/textures');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to write raw RGB buffer to BMP format (simplest valid image format to write without deps)
function writeBMP(filename, buffer, width, height) {
    const rowSize = (width * 3 + 3) & ~3; // Align to 4 bytes
    const fileSize = 54 + rowSize * height;
    const header = Buffer.alloc(54);

    // Bitmap Header
    header.write('BM'); // Signature
    header.writeUInt32LE(fileSize, 2); // File size
    header.writeUInt32LE(54, 10); // Offset to pixel data

    // DIB Header
    header.writeUInt32LE(40, 14); // Header size
    header.writeInt32LE(width, 18); // Width
    header.writeInt32LE(height, 22); // Height (positive = bottom-up, we'll flip data)
    header.writeUInt16LE(1, 26); // Planes
    header.writeUInt16LE(24, 28); // Bits per pixel
    header.writeUInt32LE(0, 30); // Compression (BI_RGB)
    header.writeUInt32LE(rowSize * height, 34); // Image size

    const pixelData = Buffer.alloc(rowSize * height);

    // Write pixel data (BMP is BGR)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Flip Y for BMP
            const srcIdx = ((height - 1 - y) * width + x) * 3;
            const dstIdx = y * rowSize + x * 3;

            const r = buffer[srcIdx];
            const g = buffer[srcIdx + 1];
            const b = buffer[srcIdx + 2];

            pixelData[dstIdx] = b;     // Blue
            pixelData[dstIdx + 1] = g; // Green
            pixelData[dstIdx + 2] = r; // Red
        }
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, filename), Buffer.concat([header, pixelData]));
    console.log(`Generated ${filename}`);
}

function createTexture(name, generator) {
    const buffer = Buffer.alloc(TEXTURE_SIZE * TEXTURE_SIZE * 3);
    for (let y = 0; y < TEXTURE_SIZE; y++) {
        for (let x = 0; x < TEXTURE_SIZE; x++) {
            const [r, g, b] = generator(x, y);
            const idx = (y * TEXTURE_SIZE + x) * 3;
            buffer[idx] = Math.min(255, Math.max(0, r));
            buffer[idx + 1] = Math.min(255, Math.max(0, g));
            buffer[idx + 2] = Math.min(255, Math.max(0, b));
        }
    }
    writeBMP(name, buffer, TEXTURE_SIZE, TEXTURE_SIZE);
}

// 1. Tech Wall (Grey with panel lines and lights)
createTexture('wall_tech.bmp', (x, y) => {
    // Base grey
    let c = 100 + Math.random() * 20;

    // Grid lines
    if (x % 16 === 0 || y % 16 === 0) c *= 0.6;

    // Random "lights"
    if (x > 4 && x < 12 && y > 4 && y < 12) {
        return [50, 200, 50]; // Green light
    }

    // Noise
    c += (Math.random() - 0.5) * 10;

    return [c, c, c + 10]; // Slight blue tint
});

// 2. Brick Wall (Brown/Red)
createTexture('wall_brick.bmp', (x, y) => {
    const brickW = 16;
    const brickH = 8;
    const offset = (Math.floor(y / brickH) % 2) * (brickW / 2);
    const bx = (x + offset) % brickW;
    const by = y % brickH;

    let r = 140, g = 60, b = 40;

    // Mortar
    if (bx === 0 || by === 0) {
        r = 180; g = 170; b = 160;
    } else {
        // Brick noise
        const noise = (Math.random() - 0.5) * 30;
        r += noise;
        g += noise;
        b += noise;
    }

    return [r, g, b];
});

// 3. Stone Wall (Grey/Greenish noise)
createTexture('wall_stone.bmp', (x, y) => {
    let n = Math.random() * 80 + 60;
    // Cobblestone-ish pattern
    const cx = Math.floor(x / 16);
    const cy = Math.floor(y / 16);
    // Darken edges of cells
    if (x % 16 < 2 || y % 16 < 2) n *= 0.5;

    return [n, n * 1.1, n * 0.9];
});

// 4. Metal Wall (Dark grey with rust)
createTexture('wall_metal.bmp', (x, y) => {
    let c = 80 + Math.random() * 20;

    // Rivets
    if ((x % 32 === 4 || x % 32 === 28) && (y % 32 === 4 || y % 32 === 28)) {
        c += 60;
    }

    // Rust streaks
    let isRust = Math.random() > 0.95;
    if (isRust || (x % 10 === 0 && Math.random() > 0.5)) {
        return [120, 60, 40];
    }

    return [c, c, c];
});

console.log('Textures generated in public/textures/');
