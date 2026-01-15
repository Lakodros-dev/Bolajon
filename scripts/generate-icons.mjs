/**
 * PWA Icon Generator
 * Generates all required PWA icons from logo.png
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
    const inputPath = join(rootDir, 'public', 'favicon.png');
    const outputDir = join(rootDir, 'public', 'icons');

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    console.log('🎨 Generating PWA icons...\n');

    for (const size of sizes) {
        const outputPath = join(outputDir, `icon-${size}x${size}.png`);

        await sharp(inputPath)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toFile(outputPath);

        console.log(`✅ Generated icon-${size}x${size}.png`);
    }

    // Generate apple-touch-icon (180x180)
    await sharp(inputPath)
        .resize(180, 180, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(join(rootDir, 'public', 'apple-touch-icon.png'));

    console.log('✅ Generated apple-touch-icon.png');

    // Generate favicon (32x32)
    await sharp(inputPath)
        .resize(32, 32, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(join(rootDir, 'public', 'favicon.png'));

    console.log('✅ Generated favicon.png');

    console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
