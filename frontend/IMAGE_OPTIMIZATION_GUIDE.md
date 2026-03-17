# Image Optimization & WebP Conversion Guide

## 📊 Current Image Analysis

From PageSpeed Insights, these issues were identified:

- **Total proof images**: ~1,226 KiB (potential savings: 865 KiB)
- **Work photos 3, 2, 1**: 412 KiB → 180 KiB, 346 KiB → 168 KiB potential savings
- **Unused JS (GTM + React)**: 133.4 KiB unnecessary overhead

---

## 🚀 Image Optimization Steps

### Step 1: Install Image Conversion Tools

**Option A: Using FFmpeg (Recommended)**
```bash
# macOS
brew install ffmpeg

# Windows (with Chocolatey)
choco install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg
```

**Option B: Using ImageMagick**
```bash
# macOS
brew install imagemagick

# Windows
choco install imagemagick
```

### Step 2: Convert Images to WebP

#### Convert Proof Images (Gallery)
```bash
# Windows PowerShell
Get-ChildItem -Path "public/proofs" -Filter "*.jpg", "*.jpeg", "*.png" | ForEach-Object {
    ffmpeg -i $_.FullName -c:v libwebp -q:v 80 "$($_.DirectoryName)/$($_.BaseName).webp"
}

# macOS/Linux
find public/proofs -maxdepth 1 \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) \
  -exec ffmpeg -i {} -c:v libwebp -q:v 80 {}.webp \;
```

#### Convert Pooja Assets
```bash
# Windows PowerShell
Get-ChildItem -Path "src/assets/poojas" -Filter "*.jpg", "*.jpeg", "*.png" | ForEach-Object {
    ffmpeg -i $_.FullName -vf "scale=600:600:force_original_aspect_ratio=decrease" \
      -c:v libwebp -q:v 85 "$($_.DirectoryName)/$($_.BaseName).webp"
}

# macOS/Linux
find src/assets/poojas -maxdepth 1 \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) \
  -exec ffmpeg -i {} -vf "scale=600:600:force_original_aspect_ratio=decrease" \
  -c:v libwebp -q:v 85 {}.webp \;
```

### Step 3: Verify Conversion & Compression

```bash
# Compare file sizes (macOS/Linux)
du -h public/proofs/*.jpg src/assets/poojas/*.jpg
du -h public/proofs/*.webp src/assets/poojas/*.webp

# Windows PowerShell
Get-ChildItem "public/proofs" -Filter "*.jpg" | ForEach-Object { 
  Write-Host "$($_.Name): $([Math]::Round($_.Length/1KB, 2)) KiB" 
}
Get-ChildItem "public/proofs" -Filter "*.webp" | ForEach-Object { 
  Write-Host "$($_.Name): $([Math]::Round($_.Length/1KB, 2)) KiB" 
}
```

### Step 4: Update Image Sources

#### For Service Card Images
```jsx
// Before
<img src={jpgImage} alt="Service" loading="lazy" />

// After - Use picture element for best support
<picture>
  <source srcSet={webpImage} type="image/webp" />
  <img src={jpgImage} alt="Service" loading="lazy" sizes="(max-width: 640px) 100vw, 50vw" />
</picture>
```

#### For Gallery Images in WorkProofGallery.jsx
```jsx
// Update image sources to use webp with fallbacks
const proofImages = [
  '/proofs/p.webp',
  '/proofs/work1.webp',
  '/proofs/work2.webp',
  // ... etc
];

// In component
<picture>
  <source srcSet={image} type="image/webp" />
  <img 
    src={image.replace('.webp', '.jpeg')} 
    alt="..." 
    loading="lazy"
  />
</picture>
```

### Step 5: Update poojaImageMap.js

```javascript
// Add .webp versions alongside existing imports
import annaprashanImg from './poojas/annaprashan-puja.webp'
import bhoomiPujaImg from './poojas/Bhoomi Puja.webp'
// ... etc

// Add fallback mapping for browsers without WebP support
const poojaImageFallbacks = {
  annaprashanImg: './poojas/annaprashan-puja.jpg',
  bhoomiPujaImg: './poojas/Bhoomi Puja.jpeg',
  // ... etc
}
```

---

## 📈 Expected Performance Gains

| Optimization | Savings | Impact |
|--------------|---------|--------|
| **LCP Image Fix** | ~400ms | CRITICAL |
| **WebP Conversion** | 600-800 KiB | HIGH |
| **Font Preload** | ~150ms | MEDIUM |
| **CSS Preload** | ~100ms | MEDIUM |
| **JS Optimization** | 35-50 KiB | LOW |
| **Total** | **~1 second** | **+25-40 point boost** |

---

## 🔧 Optimization Checklist

- [ ] Install FFmpeg or ImageMagick
- [ ] Convert all JPEG/PNG to WebP
- [ ] Back up original images
- [ ] Update component image imports
- [ ] Update poojaImageMap.js
- [ ] Update WorkProofGallery.jsx
- [ ] Test browser compatibility (use caniuse for WebP)
- [ ] Run PageSpeed Insights again
- [ ] Verify no broken images in production

---

## 📊 Quality Settings Guide

| Use Case | Quality | Notes |
|----------|---------|-------|
| **Hero images** | 75-80 | Visible at large sizes |
| **Gallery cards** | 75-80 | Cards are medium-sized |
| **Thumbnails** | 70-75 | Small preview images |
| **Background** | 70 | Less visible detail needed |

---

## 🆘 Troubleshooting

**Images look pixelated:**
- Increase quality setting (75→85)
- Check image was properly scaled first

**Browser showing JPEG instead of WebP:**
- Verify `<picture>` element syntax
- Check `type="image/webp"` attribute
- Check WebP files exist in correct path

**Large file size gain was minimal:**
- Images may already be compressed
- JPEGs to WebP gives 60-70% on uncompressed source
- Check original image wasn't already optimized

---

## 📚 References

- [WebP Format Docs](https://developers.google.com/speed/webp)
- [Image Optimization Guide](https://web.dev/image-optimization/)
- [FFmpeg WebP Guide](https://trac.ffmpeg.org/wiki/Encode/VP8)
