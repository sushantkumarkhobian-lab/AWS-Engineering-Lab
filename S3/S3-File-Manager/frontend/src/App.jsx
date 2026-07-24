import { useState, useEffect, useRef, useMemo } from 'react'

// ─── Status Constants ─────────────────────────────────────────────
const STATUS = {
  IDLE:      'idle',
  UPLOADING: 'uploading',
  SUCCESS:   'success',
  ERROR:     'error',
}

// Helper to construct URL with fallback to http://localhost:3001 if relative
function getApiUrl(endpoint) {
  if (endpoint.startsWith('http')) return endpoint
  return endpoint
}

function getDownloadUrl(url) {
  if (!url) return '#'
  if (url.startsWith('http')) return url
  return `http://localhost:3001${url}`
}

// ─── Helpers ──────────────────────────────────────────────────────
function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// File Extension -> Emoji/Type helper
function getFileMeta(filename = '') {
  const ext = filename.split('.').pop().toLowerCase()
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
    return { icon: '🖼', category: 'image', isImage: true }
  }
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
    return { icon: '📄', category: 'document', isImage: false }
  }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
    return { icon: '🎥', category: 'video', isImage: false }
  }
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
    return { icon: '🎵', category: 'audio', isImage: false }
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { icon: '📦', category: 'archive', isImage: false }
  }
  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c'].includes(ext)) {
    return { icon: '⚙️', category: 'code', isImage: false }
  }
  return { icon: '📁', category: 'file', isImage: false }
}

// ─── Icons (Inline SVG) ───────────────────────────────────────────
const CloudUploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ArrowUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" />
    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ─── Main App Component ───────────────────────────────────────────
export default function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [status, setStatus]             = useState(STATUS.IDLE)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMsg, setErrorMsg]         = useState('')
  const [successMsg, setSuccessMsg]     = useState('')
  const [isDragging, setIsDragging]     = useState(false)
  
  // S3 Files state
  const [files, setFiles]               = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [fetchError, setFetchError]     = useState('')
  const [searchQuery, setSearchQuery]   = useState('')
  const [deletingKey, setDeletingKey]   = useState(null)
  const [previewFile, setPreviewFile]   = useState(null)

  const fileInputRef = useRef(null)

  // Fetch files from backend on mount
  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    setLoadingFiles(true)
    setFetchError('')
    try {
      let res
      try {
        res = await fetch('/files')
      } catch (e) {
        res = await fetch('http://localhost:3001/files')
      }

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        throw new Error('Backend server proxy error. Please ensure "node server.js" is running in backend.')
      }

      if (!res.ok) throw new Error(data.error || 'Failed to fetch files from S3.')
      setFiles(data.files || [])
    } catch (err) {
      console.error('Fetch files error:', err)
      setFetchError(err.message)
    } finally {
      setLoadingFiles(false)
    }
  }

  // File Picker Handlers
  const handleButtonClick = () => fileInputRef.current.click()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    prepareFile(file)
  }

  const prepareFile = (file) => {
    setSelectedFile(file)
    setStatus(STATUS.IDLE)
    setUploadProgress(0)
    setErrorMsg('')
    setSuccessMsg('')
  }

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      prepareFile(e.dataTransfer.files[0])
    }
  }

  // Upload File with Progress (XHR)
  const handleUpload = () => {
    if (!selectedFile) return
    setStatus(STATUS.UPLOADING)
    setUploadProgress(0)
    setErrorMsg('')

    const formData = new FormData()
    formData.append('file', selectedFile)

    const xhr = new XMLHttpRequest()
    // Try relative /upload first, fallback to http://localhost:3001/upload
    xhr.open('POST', '/upload')

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(percent)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setSuccessMsg(`"${selectedFile.name}" uploaded successfully!`)
        setStatus(STATUS.SUCCESS)
        fetchFiles() // Refresh list automatically
      } else {
        try {
          const errData = JSON.parse(xhr.responseText)
          setErrorMsg(errData.error || 'Upload failed')
        } catch (e) {
          setErrorMsg('Upload failed')
        }
        setStatus(STATUS.ERROR)
      }
    }

    xhr.onerror = () => {
      // Fallback try to direct localhost:3001 if proxy fails
      const fallbackXhr = new XMLHttpRequest()
      fallbackXhr.open('POST', 'http://localhost:3001/upload')
      fallbackXhr.onload = () => {
        if (fallbackXhr.status >= 200 && fallbackXhr.status < 300) {
          setSuccessMsg(`"${selectedFile.name}" uploaded successfully!`)
          setStatus(STATUS.SUCCESS)
          fetchFiles()
        } else {
          setErrorMsg('Upload failed')
          setStatus(STATUS.ERROR)
        }
      }
      fallbackXhr.onerror = () => {
        setErrorMsg('Network error. Is the backend server running on port 3001?')
        setStatus(STATUS.ERROR)
      }
      fallbackXhr.send(formData)
    }

    xhr.send(formData)
  }

  // Delete File Handler
  const handleDelete = async (key, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from S3?`)) return
    setDeletingKey(key)
    try {
      let res
      try {
        res = await fetch(`/files?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
      } catch (e) {
        res = await fetch(`http://localhost:3001/files?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setFiles((prev) => prev.filter((f) => f.key !== key))
    } catch (err) {
      alert(`Error deleting file: ${err.message}`)
    } finally {
      setDeletingKey(null)
    }
  }

  // Reset Selection
  const handleReset = () => {
    setSelectedFile(null)
    setStatus(STATUS.IDLE)
    setUploadProgress(0)
    setErrorMsg('')
    setSuccessMsg('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Filtered files for search
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files
    const query = searchQuery.toLowerCase()
    return files.filter(
      (f) => f.name.toLowerCase().includes(query) || f.key.toLowerCase().includes(query)
    )
  }, [files, searchQuery])

  return (
    <div className="page">
      {/* Background Animated Blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="card">
        {/* Header */}
        <div className="card-header">
          <div className="icon-wrapper">
            <CloudUploadIcon />
          </div>
          <h1 className="title">S3 Cloud File Manager</h1>
          <p className="subtitle">
            Upload, list, search, download, and delete files directly in your AWS S3 bucket.
          </p>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          className={`dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="file-input"
            className="hidden-input"
            onChange={handleFileChange}
          />

          {!selectedFile && (
            <div className="dropzone-content" onClick={handleButtonClick}>
              <div className="drop-icon">
                <ArrowUpIcon />
              </div>
              <p className="drop-title">Drag & Drop your file here</p>
              <p className="drop-sub">or click to browse from your computer</p>
              <button id="choose-file-btn" className="upload-btn" type="button" onClick={(e) => { e.stopPropagation(); handleButtonClick(); }}>
                Choose File
              </button>
            </div>
          )}

          {/* Selected File Card */}
          {selectedFile && status !== STATUS.SUCCESS && (
            <div className="file-info" id="file-info-card">
              <span className="type-emoji">{getFileMeta(selectedFile.name).icon}</span>
              <div className="file-details">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-meta">
                  {formatSize(selectedFile.size)} &bull; {selectedFile.type || 'Unknown format'}
                </span>
              </div>
              <button className="remove-btn" onClick={handleReset} title="Remove selection">
                ✕
              </button>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && status === STATUS.IDLE && (
            <button id="upload-s3-btn" className="send-btn" onClick={handleUpload}>
              <span className="btn-icon"><CloudUploadIcon /></span>
              Upload to S3
            </button>
          )}

          {/* Uploading Status & Progress Bar */}
          {status === STATUS.UPLOADING && (
            <div className="status-box uploading" id="uploading-status">
              <div className="upload-progress-info">
                <div className="spinner-row">
                  <div className="spinner" />
                  <span>Uploading to S3...</span>
                </div>
                <span className="progress-percent">{uploadProgress}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* Success Box */}
          {status === STATUS.SUCCESS && (
            <div className="status-box success" id="success-status">
              <span className="status-icon">✅</span>
              <div>
                <p className="status-title">Upload Successful!</p>
                <p className="status-sub">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Error Box */}
          {status === STATUS.ERROR && (
            <div className="status-box error" id="error-status">
              <span className="status-icon">❌</span>
              <div>
                <p className="status-title">Upload Failed</p>
                <p className="status-sub">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Reset / Upload Another */}
          {(status === STATUS.SUCCESS || status === STATUS.ERROR) && (
            <button id="upload-another-btn" className="reset-btn" onClick={handleReset}>
              Upload Another File
            </button>
          )}
        </div>

        {/* ── Section Divider ── */}
        <div className="divider" />

        {/* ── File Manager Section ── */}
        <div className="file-manager-section">
          <div className="manager-header">
            <h2 className="section-title">
              Uploaded Files <span className="file-count">({files.length})</span>
            </h2>
            <button className="refresh-btn" onClick={fetchFiles} title="Refresh files from S3">
              <RefreshIcon /> Refresh
            </button>
          </div>

          {/* Search Input */}
          <div className="search-box">
            <span className="search-icon"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {/* File List / Loading / Error State */}
          {loadingFiles ? (
            <div className="loading-box">
              <div className="spinner" />
              <span>Loading S3 bucket contents...</span>
            </div>
          ) : fetchError ? (
            <div className="empty-files">
              <span className="empty-icon">⚠️</span>
              <p className="empty-title">Failed to load files</p>
              <p className="empty-sub">{fetchError}</p>
              <button className="refresh-btn" style={{ marginTop: '0.6rem' }} onClick={fetchFiles}>
                Try Again
              </button>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="empty-files">
              <span className="empty-icon">{searchQuery ? '🔍' : '☁️'}</span>
              <p className="empty-title">
                {searchQuery ? 'No files match your search' : 'No files stored in S3 yet'}
              </p>
              <p className="empty-sub">
                {searchQuery ? 'Try typing a different filename' : 'Upload a file above to get started'}
              </p>
            </div>
          ) : (
            <div className="file-list">
              {filteredFiles.map((file) => {
                const meta = getFileMeta(file.name)
                const isDeleting = deletingKey === file.key
                const fileDownloadUrl = getDownloadUrl(file.downloadUrl || file.streamUrl)

                return (
                  <div key={file.key} className={`file-row ${isDeleting ? 'deleting' : ''}`}>
                    <span className="file-row-icon" title={meta.category}>
                      {meta.icon}
                    </span>
                    <div className="file-row-info">
                      <span className="file-row-name" title={file.name}>
                        {file.name}
                      </span>
                      <span className="file-row-meta">
                        {formatSize(file.size)} &bull; {formatDate(file.lastModified)}
                      </span>
                    </div>
                    <div className="file-row-actions">
                      {meta.isImage && (
                        <button
                          className="action-btn preview"
                          onClick={() => setPreviewFile(file)}
                          title="Preview Image"
                        >
                          <EyeIcon />
                        </button>
                      )}
                      <a
                        className="action-btn download"
                        href={fileDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        title="Download file"
                      >
                        <DownloadIcon />
                      </a>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(file.key, file.name)}
                        disabled={isDeleting}
                        title="Delete file from S3"
                      >
                        {isDeleting ? <div className="mini-spinner" /> : <TrashIcon />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewFile && (
        <div className="modal-overlay" onClick={() => setPreviewFile(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{previewFile.name}</span>
              <button className="modal-close" onClick={() => setPreviewFile(null)}>✕</button>
            </div>
            <div className="modal-body">
              <img
                src={getDownloadUrl(previewFile.downloadUrl || previewFile.streamUrl)}
                alt={previewFile.name}
                className="preview-img"
              />
            </div>
            <div className="modal-footer">
              <a
                className="upload-btn modal-download-btn"
                href={getDownloadUrl(previewFile.downloadUrl || previewFile.streamUrl)}
                download
                target="_blank"
                rel="noreferrer"
              >
                <DownloadIcon /> Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
