/**
 * Process New Logo
 * Makes circular icon and generates all PWA sizes
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function processLogo() {
    const inputPath = join(rootDir, 'bolajon last logo.png');
    const outputDir = join(rootDir, 'public', 'icons');

    await mkdir(outputDir, { recursive: true });

    console.log('🎨 Processing new logo...\n');

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    const size = Math.min(metadata.width, metadata.height);
    const left = Math.floor((metadata.width - size) / 2);
    const top = Math.floor((metadata.height - size) / 2);

    // Create circular mask
    const circleSize = 512;
    const circleMask = Buffer.from(
        `<svg width="${circleSize}" height="${circleSize}">
            <circle cx="${circleSize / 2}" cy="${circleSize / 2}" r="${circleSize / 2}" fill="white"/>
        </svg>`
    );

    // Process: crop center square, resize, apply circle mask
    const circularIcon = await sharp(inputPath)
        .extract({ left, top, width: size, height: size })
        .resize(circleSize, circleSize)
        .composite([{ input: circleMask, blend: 'dest-in' }])
        .png()
        .toBuffer();

    // Save main favicon
    await sharp(circularIcon).toFile(join(rootDir, 'public', 'favicon.png'));
    console.log('✅ public/favicon.png');

    // Save app icons
    await sharp(circularIcon).toFile(join(rootDir, 'app', 'icon.png'));
    console.log('✅ app/icon.png');

    await sharp(circularIcon).toFile(join(rootDir, 'app', 'apple-icon.png'));
    console.log('✅ app/apple-icon.png');

    // Generate all PWA sizes
    for (const s of sizes) {
        await sharp(circularIcon)
            .resize(s, s)
            .toFile(join(outputDir, `icon-${s}x${s}.png`));
        console.log(`✅ public/icons/icon-${s}x${s}.png`);
    }

    // Apple touch icon
    await sharp(circularIcon)
        .resize(180, 180)
        .toFile(join(rootDir, 'public', 'apple-touch-icon.png'));
    console.log('✅ public/apple-touch-icon.png');

    console.log('\n🎉 All icons generated!');
}

processLogo().catch(console.error);
