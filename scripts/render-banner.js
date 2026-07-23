/**
 * Render banner.svg to banner.png
 * Converts SVG to PNG at exactly 1920x600
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const assetsDir = join(__dirname, '..', 'assets');
const svgPath = join(assetsDir, 'banner.svg');
const pngPath = join(assetsDir, 'banner.png');

async function renderBanner() {
  try {
    console.log('📐 Reading banner.svg...');
    const svgBuffer = readFileSync(svgPath);
    
    console.log('🎨 Rendering to PNG at 1920x600...');
    await sharp(svgBuffer)
      .resize(1920, 600)
      .png()
      .toFile(pngPath);
    
    console.log('✓ Banner rendered successfully to assets/banner.png');
  } catch (error) {
    console.error('❌ Error rendering banner:', error.message);
    process.exit(1);
  }
}

renderBanner();
