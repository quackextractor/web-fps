import fs from 'fs';
import path from 'path';

let version = '0.0.0';
try {
  const versionPath = path.resolve(process.cwd(), '../version.md');
  if (fs.existsSync(versionPath)) {
    version = fs.readFileSync(versionPath, 'utf8').trim();
  } else {
    // Fallback: try to find it relative to current file if process.cwd() is different
    const altPath = path.resolve(import.meta.dirname || '.', '../version.md');
    if (fs.existsSync(altPath)) {
      version = fs.readFileSync(altPath, 'utf8').trim();
    }
  }
} catch (e) {
  console.warn('Could not read version.md', e);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GAME_VERSION: version,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
