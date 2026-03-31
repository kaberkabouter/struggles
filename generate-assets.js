import sharp from 'sharp';
import fs from 'fs';

const inputSvg = 'public/favicon.svg';

async function generate() {
  if (!fs.existsSync(inputSvg)) {
    console.error(`Error: ${inputSvg} not found.`);
    return;
  }
  const svgBuffer = fs.readFileSync(inputSvg);

  // PWA Icons
  await sharp(svgBuffer, { density: 300 })
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile('public/pwa-192x192.png');
  console.log('Generated public/pwa-192x192.png');
    
  await sharp(svgBuffer, { density: 300 })
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile('public/pwa-512x512.png');
  console.log('Generated public/pwa-512x512.png');

  // Screenshots
  await sharp({
    create: {
      width: 1280,
      height: 720,
      channels: 4,
      background: { r: 249, g: 249, b: 251, alpha: 1 } // matches your theme_color
    }
  })
  .composite([
    { input: await sharp(svgBuffer, { density: 150 }).resize(256).toBuffer(), gravity: 'center' }
  ])
  .png()
  .toFile('public/screenshot-desktop.png');
  console.log('Generated public/screenshot-desktop.png');

  await sharp({
    create: {
      width: 750,
      height: 1334,
      channels: 4,
      background: { r: 249, g: 249, b: 251, alpha: 1 } // matches your theme_color
    }
  })
  .composite([
    { input: await sharp(svgBuffer, { density: 150 }).resize(256).toBuffer(), gravity: 'center' }
  ])
  .png()
  .toFile('public/screenshot-mobile.png');
  console.log('Generated public/screenshot-mobile.png');
}

generate().catch(console.error);
