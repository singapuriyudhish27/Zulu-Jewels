import { v2 as cloudinary } from 'cloudinary';

function ensureCloudinaryConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('[Storage] Cloudinary environment variables are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/mpeg',
  'video/webm',
  'video/quicktime',
  'application/pdf'
];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB max limit (prevents OOM on 2GB RAM)

/**
 * Uploads a file to Cloudinary.
 * @param {File} file - The file object from Request.formData()
 * @param {string} folder - The subfolder in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
async function uploadToCloudinary(file, folder) {
  ensureCloudinaryConfigured();
  let buffer;
  let mimeType = '';
  let size = 0;

  if (typeof file === 'string' && file.startsWith('data:')) {
    const mimeMatch = file.match(/^data:([^;]+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
    const base64Data = file.split(',')[1];
    // Approximate base64 size check before Buffer allocation
    const approxSize = Math.ceil((base64Data.length * 3) / 4);
    if (approxSize > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    buffer = Buffer.from(base64Data, 'base64');
    size = buffer.length;
  } else if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function') {
    mimeType = file.type || '';
    size = file.size || 0;
    if (size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
  } else {
    throw new Error("Invalid file format");
  }

  // Validate file size
  if (size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Validate mime-type
  if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    throw new Error(`Invalid file type: ${mimeType || 'unknown'}. Only images, videos, and PDF documents are allowed.`);
  }
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({
      resource_type: 'auto',
      folder: `zulu_jewels/${folder}`,
    }, (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        reject(error);
      } else {
        resolve(result.secure_url);
      }
    });
    
    uploadStream.end(buffer);
  });
}

/**
 * Unified file saving utility.
 * @param {File|string} file - The file object, base64 string, or existing URL
 * @param {string} folder - The folder name (e.g., 'products', 'categories')
 * @returns {Promise<string>} - The saved file URL
 */
export async function saveFile(file, folder = "products") {
  // If it's already a URL (string) or empty, return it as is
  if (!file) return "";
  
  if (typeof file === 'string') {
    if (file.startsWith('data:')) {
      return await uploadToCloudinary(file, folder);
    }
    if (file.startsWith('/')) {
      return file; // Allow local assets
    }
    try {
      const url = new URL(file);
      if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com') {
        throw new Error("Only secure Cloudinary media resources are permitted");
      }
    } catch (err) {
      throw new Error("Invalid media URL source: " + err.message);
    }
    return file;
  }
  
  // Choose storage - Now always using Cloudinary for both dev and prod
  return await uploadToCloudinary(file, folder);
}
