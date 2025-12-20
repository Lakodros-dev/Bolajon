import sharp from 'sharp';

async function processIcon() {
    // Read original image
    const image = sharp('favicon.jpeg');
    const metadata = await image.metadata();
    const size = Math.min(metadata.width, metadata.height);

    // Crop to square from center, then resize to 512x512
    const cropped = await image
        .extract({
            left: Math.floor((metadata.width - size) / 2),
            top: Math.floor((metadata.height - size) / 2),
            width: size,
            height: size
        })
        .resize(512, 512)
        .toBuffer();

    // Create circular mask SVG
    const circleSvg = Buffer.from(
        `<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill="white"/></svg>`
    );

    // Apply circular mask
    await sharp(cropped)
        .composite([{
            input: circleSvg,
            blend: 'dest-in'
        }])
        .png()
        .toFile('public/favicon.png');

    console.log('✅ Circular favicon created: public/favicon.png');
}

processIcon().catch(console.error);
