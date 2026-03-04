import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const args = process.argv.slice(2)

const getArgValue = (flag, fallback) => {
  const index = args.indexOf(flag)
  if (index === -1 || index === args.length - 1) return fallback
  return args[index + 1]
}

const hasFlag = (flag) => args.includes(flag)

const quality = Number(getArgValue('--quality', '78'))
const rootDir = path.resolve(getArgValue('--dir', 'src/assets/poojas'))
const deleteOriginal = hasFlag('--delete-original')

const supportedExtensions = new Set(['.png', '.jpg', '.jpeg'])

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
    } else {
      files.push(fullPath)
    }
  }

  return files
}

const run = async () => {
  const files = await walk(rootDir)
  const candidates = files.filter((filePath) =>
    supportedExtensions.has(path.extname(filePath).toLowerCase())
  )

  if (candidates.length === 0) {
    console.log('No images found to optimize.')
    return
  }

  for (const filePath of candidates) {
    const parsed = path.parse(filePath)
    const outputPath = path.join(parsed.dir, `${parsed.name}.webp`)
    await sharp(filePath).webp({ quality }).toFile(outputPath)
    if (deleteOriginal) {
      await fs.unlink(filePath)
    }
    console.log(`${path.relative(process.cwd(), filePath)} -> ${path.relative(process.cwd(), outputPath)}`)
  }

  console.log(`Optimized ${candidates.length} image(s) with quality=${quality}.`)
}

run().catch((error) => {
  console.error('Image optimization failed:', error)
  process.exit(1)
})
