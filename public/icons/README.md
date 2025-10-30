# PWA Icons Guide

## Required Icons

To complete the PWA setup, you need to add the following icon files to the `/public/icons/` directory:

### Icon Sizes Required:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png (for Apple devices)
- icon-192x192.png (required for PWA)
- icon-384x384.png
- icon-512x512.png (required for PWA)

## Creating Icons

You can create these icons using:

1. **Online Tools:**
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
   - https://favicon.io/

2. **From your logo:**
   - Use your logo from `/public/logo/` directory
   - Resize to all required dimensions
   - Ensure square aspect ratio (1:1)
   - Use PNG format with transparent background

3. **Design Guidelines:**
   - Keep design simple and recognizable
   - Use high contrast colors
   - Test on light and dark backgrounds
   - Ensure logo is centered with padding

## Screenshots (Optional)

For enhanced PWA listing in app stores, add screenshots to `/public/screenshots/`:
- home.png (1280x720) - Desktop view
- products.png (540x720) - Mobile view

## Quick Setup Script

You can use ImageMagick to resize a single logo:

```bash
# Install ImageMagick first: sudo apt install imagemagick

# From a base logo (e.g., logo-512.png)
convert logo-512.png -resize 72x72 public/icons/icon-72x72.png
convert logo-512.png -resize 96x96 public/icons/icon-96x96.png
convert logo-512.png -resize 128x128 public/icons/icon-128x128.png
convert logo-512.png -resize 144x144 public/icons/icon-144x144.png
convert logo-512.png -resize 152x152 public/icons/icon-152x152.png
convert logo-512.png -resize 192x192 public/icons/icon-192x192.png
convert logo-512.png -resize 384x384 public/icons/icon-384x384.png
convert logo-512.png -resize 512x512 public/icons/icon-512x512.png
```

## Verification

After adding icons, verify your PWA setup:
1. Run `npm run dev` or `npm run build && npm start`
2. Open Chrome DevTools > Application > Manifest
3. Check that all icons load correctly
4. Test the "Install" button appears in supported browsers
