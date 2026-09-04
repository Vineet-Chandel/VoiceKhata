import sharp from 'sharp'

await sharp('src/assets/Logo_white.png')
  .resize(192, 192)
  .toFile('public/logo-192.png')

await sharp('src/assets/Logo_white.png')
  .resize(512, 512)
  .toFile('public/logo-512.png')

console.log('Done')