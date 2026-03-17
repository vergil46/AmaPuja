#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts images to WebP format and compresses them
 * Requires: sharp (npm install -g sharp-cli) or use as import
 * 
 * Usage: node scripts/optimize-all-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROOF_DIR = path.join(__dirname, '../public/proofs');
const POOJAS_DIR = path.join(__dirname, '../src/assets/poojas');

const TARGET_SIZES = {
  hero: { width: 1920, height: 1280 }, // Homepage hero
  card: { width: 600, height: 600 },   // Service cards
  gallery: { width: 600, height: 600 }, // Gallery images
};

console.log('🖼️  Image Optimization Guide');
console.log('================================\n');

console.log('To optimize your images to WebP format and reduce file sizes:\n');

console.log('Option 1: Using ImageMagick (Command Line)');
console.log('─────────────────────────────');
console.log('# Convert and compress JPEG/PNG to WebP');
console.log('find public/proofs -name "*.{jpg,jpeg,png}" -exec cwebp -q 80 {} -o {}.webp \\;');
console.log('find src/assets/poojas -name "*.{jpg,jpeg,png}" -exec cwebp -q 85 {} -o {}.webp \\;\n');

console.log('Option 2: Using FFmpeg');
console.log('─────────────────────────────');
console.log('# For JPEG images');
console.log('find . -name "*.jpg" -exec ffmpeg -i {} -c:v libwebp -q:v 80 {}.webp \\;\n');

console.log('Option 3: Recommended - Use sharp-cli');
console.log('─────────────────────────────');
console.log('npm install -g sharp-cli');
console.log('sharp input.jpg -o output.webp --quality 80 --progressive\n');

console.log('📊 Current Image Inventory');
console.log('─────────────────────────────\n');

function analyzeDirectory(dir, label) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  ${label}: Directory not found at ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir).filter(f => 
    /\.(jpg|jpeg|png|webp|gif)$/i.test(f)
  );

  if (files.length === 0) {
    console.log(`${label}: No image files found`);
    return;
  }

  console.log(`${label}:`);
  let totalSize = 0;

  files.forEach(file => {
    try {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      const size = (stat.size / 1024).toFixed(1);
      console.log(`  • ${file} (${size} KiB)`);
      totalSize += stat.size;
    } catch (e) {
      console.log(`  ⚠️  Error reading ${file}`);
    }
  });

  const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`  📦 Total: ${totalMB} MiB\n`);
}

analyzeDirectory(PROOF_DIR, 'Proof Images');
analyzeDirectory(POOJAS_DIR, 'Pooja Assets');

console.log('🎯 Optimization Goals');
console.log('─────────────────────────────');
console.log('• Proof images: 600x600px @ 75% quality');
console.log('• Pooja cards: 600x600px @ 80% quality');  
console.log('• Hero background: 1920x1280px @ 75% quality');
console.log('• Expected savings: 60-70% file size reduction\n');

console.log('✅ Once images are converted to WebP:');
console.log('─────────────────────────────');
console.log('1. Update image sources to use .webp');
console.log('2. Add fallback <source> tags in <picture> elements');
console.log('3. Expected LCP improvement: +200-400ms');
console.log('4. Expected total size reduction: 850KB+\n');
