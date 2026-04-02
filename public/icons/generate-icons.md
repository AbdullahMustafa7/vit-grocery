# Icon Generation Instructions

To generate proper PWA icons for VIT Grocery, use one of these methods:

## Option 1: Use a PWA Icon Generator (Recommended)
1. Go to https://realfavicongenerator.net
2. Upload a green leaf image (🌿)
3. Download the generated icons
4. Place them in this folder with these names:
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

## Option 2: Create via Script
Run this Node.js snippet (requires `sharp` package: `npm i sharp`):
```js
const sharp = require('sharp')
const sizes = [72, 96, 128, 144, 192, 384, 512]
// ... create green gradient icon with Leaf text
```

## Option 3: Quick Placeholder
For development, you can use any 512x512 PNG image named icon-512x512.png
and the manifest will still work.
