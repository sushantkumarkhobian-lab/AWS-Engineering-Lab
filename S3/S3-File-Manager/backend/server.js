// ═══════════════════════════════════════════════════════════════════
//  S3 File Uploader & Manager — Backend (Node.js + Express + AWS SDK v3)
//  Start with:  node server.js
// ═══════════════════════════════════════════════════════════════════

require('dotenv').config()

const express = require('express')
const cors    = require('cors')
const multer  = require('multer')
const { 
  S3Client, 
  PutObjectCommand, 
  ListObjectsV2Command, 
  GetObjectCommand, 
  DeleteObjectCommand 
} = require('@aws-sdk/client-s3')

let getSignedUrl
try {
  getSignedUrl = require('@aws-sdk/s3-request-presigner').getSignedUrl
} catch (e) {
  console.warn('⚠️  @aws-sdk/s3-request-presigner not loaded, presigned URLs will fallback to S3/direct stream URLs.')
}

// ───────────────────────────────────────────────────────────────────
//  AWS CONFIGURATION & ENVIRONMENT VARIABLES
// ───────────────────────────────────────────────────────────────────
const AWS_ACCESS_KEY_ID     = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const AWS_REGION            = process.env.AWS_REGION || 'us-east-1'
const S3_BUCKET_NAME        = process.env.S3_BUCKET_NAME || 'your-s3-bucket-name'
const PORT                  = process.env.PORT || 3001

// Initialise the S3 client
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId:     AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
})

// Multer storage configuration (in-memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50 MB max
})

// Express App
const app = express()
app.use(express.json())

// Allow requests from React dev server
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  })
)

// ───────────────────────────────────────────────────────────────────
//  POST /upload — Upload a file to S3 (PutObjectCommand)
// ───────────────────────────────────────────────────────────────────
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was provided.' })
  }

  const { originalname, mimetype, buffer } = req.file
  const s3Key = `uploads/${Date.now()}-${originalname}`

  const command = new PutObjectCommand({
    Bucket:      S3_BUCKET_NAME,
    Key:         s3Key,
    Body:        buffer,
    ContentType: mimetype,
  })

  try {
    await s3.send(command)

    let presignedUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`
    if (getSignedUrl) {
      try {
        const getCmd = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: s3Key })
        presignedUrl = await getSignedUrl(s3, getCmd, { expiresIn: 3600 })
      } catch (e) {
        // fallback to standard URL
      }
    }

    console.log(`✅  Uploaded successfully → ${s3Key}`)

    return res.status(200).json({
      message:  'File uploaded successfully to S3.',
      filename: originalname,
      key:      s3Key,
      url:      presignedUrl,
    })
  } catch (err) {
    console.error('❌  S3 upload error:', err)
    return res.status(500).json({ error: err.message || 'S3 upload failed.' })
  }
})

// ───────────────────────────────────────────────────────────────────
//  GET /files — List all uploaded files in S3 (ListObjectsV2Command)
// ───────────────────────────────────────────────────────────────────
app.get('/files', async (_req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
    })
    const response = await s3.send(command)

    const rawContents = response.Contents || []
    const files = await Promise.all(
      rawContents.map(async (item) => {
        let downloadUrl = `/download?key=${encodeURIComponent(item.Key)}`
        if (getSignedUrl) {
          try {
            const getCmd = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: item.Key })
            downloadUrl = await getSignedUrl(s3, getCmd, { expiresIn: 3600 })
          } catch (e) {
            // fallback to streaming download route
          }
        }

        return {
          key:          item.Key,
          name:         item.Key.replace(/^uploads\/\d+-/, '').split('/').pop() || item.Key,
          rawKeyName:   item.Key.split('/').pop(),
          size:         item.Size,
          lastModified: item.LastModified,
          downloadUrl:  downloadUrl,
          streamUrl:    `/download?key=${encodeURIComponent(item.Key)}`,
        }
      })
    )

    // Sort newest first
    files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))

    return res.status(200).json({ files })
  } catch (err) {
    console.error('❌  S3 list files error:', err)
    return res.status(500).json({ error: err.message || 'Failed to list files from S3.' })
  }
})

// ───────────────────────────────────────────────────────────────────
//  GET /download — Download/Stream file from S3 (GetObjectCommand)
// ───────────────────────────────────────────────────────────────────
app.get('/download', async (req, res) => {
  const key = req.query.key
  if (!key) {
    return res.status(400).json({ error: 'File key parameter "key" is required.' })
  }

  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key:    key,
    })
    const response = await s3.send(command)
    const filename = key.replace(/^uploads\/\d+-/, '').split('/').pop() || 'download'

    res.setHeader('Content-Type', response.ContentType || 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
    if (response.ContentLength) {
      res.setHeader('Content-Length', response.ContentLength)
    }

    response.Body.pipe(res)
  } catch (err) {
    console.error('❌  S3 download error:', err)
    return res.status(500).json({ error: err.message || 'Failed to download file from S3.' })
  }
})

// ───────────────────────────────────────────────────────────────────
//  DELETE /files — Delete a file from S3 (DeleteObjectCommand)
// ───────────────────────────────────────────────────────────────────
app.delete('/files', async (req, res) => {
  const key = req.query.key || (req.body && req.body.key)
  if (!key) {
    return res.status(400).json({ error: 'File key parameter "key" is required.' })
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key:    key,
    })
    await s3.send(command)

    console.log(`🗑️  Deleted successfully → ${key}`)
    return res.status(200).json({ message: 'File deleted successfully from S3.', key })
  } catch (err) {
    console.error('❌  S3 delete error:', err)
    return res.status(500).json({ error: err.message || 'Failed to delete file from S3.' })
  }
})

// ───────────────────────────────────────────────────────────────────
//  GET /health — Sanity check
// ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', bucket: S3_BUCKET_NAME, region: AWS_REGION })
})

// ───────────────────────────────────────────────────────────────────
//  Start server
// ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Backend running at http://localhost:${PORT}`)
  console.log(`    POST   /upload   → Stream file to S3 bucket: "${S3_BUCKET_NAME}"`)
  console.log(`    GET    /files    → List objects in S3 bucket`)
  console.log(`    GET    /download → Download object stream from S3`)
  console.log(`    DELETE /files    → Delete object from S3`)
  console.log(`    GET    /health   → Health check`)
  console.log(`\n⚠️   Make sure your credentials in backend/.env are valid before uploading!\n`)
})
