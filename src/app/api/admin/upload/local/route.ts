import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { mkdir } from 'fs/promises'
import crypto from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

// Get file ID from TUS header
function getFileId(req: NextRequest): string | null {
  return req.headers.get('tus-resumable') ? crypto.randomUUID() : null
}

// Handle TUS protocol
export async function PATCH(req: NextRequest) {
  await ensureUploadDir()

  const uploadOffset = req.headers.get('upload-offset')
  const uploadLength = req.headers.get('upload-length')
  const uploadMetadata = req.headers.get('upload-metadata')

  // Parse upload metadata to get filename
  let filename = 'unknown'
  if (uploadMetadata) {
    const meta = uploadMetadata.split(',').find(m => m.startsWith('filename '))
    if (meta) {
      const base64 = meta.split(' ')[1]
      filename = Buffer.from(base64, 'base64').toString('utf-8')
    }
  }

  // Create unique file path
  const ext = path.extname(filename) || ''
  const baseName = path.basename(filename, ext)
  const uniqueName = `${baseName}-${Date.now()}${ext}`
  const filePath = path.join(UPLOAD_DIR, uniqueName)

  try {
    // If this is the first chunk, create the file
    if (!uploadOffset || uploadOffset === '0') {
      await fs.writeFile(filePath, Buffer.alloc(0))
    }

    // Append the chunk
    const currentSize = (await fs.stat(filePath)).size
    const arrayBuffer = await req.arrayBuffer()
    const chunk = Buffer.from(arrayBuffer)

    // Write at specific offset
    const existing = await fs.readFile(filePath)
    const newBuffer = Buffer.concat([existing.slice(0, currentSize), chunk])
    await fs.writeFile(filePath, newBuffer)

    const newOffset = currentSize + chunk.length
    const totalLength = uploadLength ? parseInt(uploadLength) : newOffset

    return new NextResponse(null, {
      status: 204,
      headers: {
        'Upload-Offset': newOffset.toString(),
        'Upload-Length': totalLength.toString(),
        'Tus-Resumable': '1.0.0',
      },
    })
  } catch (error) {
    console.error('TUS PATCH error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function HEAD(req: NextRequest) {
  await ensureUploadDir()

  const filename = req.headers.get('upload-metadata')
    ?.split(',')
    .find(m => m.startsWith('filename '))
    ?.split(' ')[1]

  if (!filename) {
    return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
  }

  const base64 = Buffer.from(filename, 'utf-8').toString('base64')
  const ext = path.extname(filename) || ''
  const baseName = path.basename(filename, ext)
  const searchName = `${baseName}-*${ext}`

  try {
    const files = await fs.readdir(UPLOAD_DIR)
    const matchingFile = files.find(f => f.startsWith(baseName) && f.endsWith(ext))

    if (matchingFile) {
      const stats = await fs.stat(path.join(UPLOAD_DIR, matchingFile))
      return new NextResponse(null, {
        headers: {
          'Upload-Offset': stats.size.toString(),
          'Upload-Length': stats.size.toString(),
          'Tus-Resumable': '1.0.0',
        },
      })
    }
  } catch {
    // File doesn't exist
  }

  return new NextResponse(null, {
    status: 404,
    headers: {
      'Tus-Resumable': '1.0.0',
    },
  })
}

// POST - Create new upload
export async function POST(req: NextRequest) {
  await ensureUploadDir()

  const uploadLength = req.headers.get('upload-length')
  const uploadMetadata = req.headers.get('upload-metadata')

  if (!uploadLength) {
    return NextResponse.json({ error: 'Upload-Length header required' }, { status: 400 })
  }

  // Parse filename from metadata
  let filename = 'upload'
  if (uploadMetadata) {
    const meta = uploadMetadata.split(',').find(m => m.startsWith('filename '))
    if (meta) {
      const base64 = meta.split(' ')[1]
      filename = Buffer.from(base64, 'base64').toString('utf-8')
    }
  }

  // Create empty file
  const ext = path.extname(filename) || ''
  const baseName = path.basename(filename, ext)
  const uniqueName = `${baseName}-${Date.now()}${ext}`
  const filePath = path.join(UPLOAD_DIR, uniqueName)

  await fs.writeFile(filePath, Buffer.alloc(0))

  return new NextResponse(uniqueName, {
    status: 201,
    headers: {
      'Location': `/api/admin/upload/local?filename=${uniqueName}`,
      'Upload-Offset': '0',
      'Upload-Length': uploadLength,
      'Tus-Resumable': '1.0.0',
    },
  })
}