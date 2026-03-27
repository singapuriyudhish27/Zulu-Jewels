import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary.
 * @param {File} file - The file object from Request.formData()
 * @param {string} folder - The subfolder in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
async function uploadToCloudinary(file, folder) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
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
 * Saves a file locally to the public/uploads folder.
 * @param {File} file - The file object from Request.formData()
 * @param {string} folder - The subfolder in public/uploads
 * @returns {Promise<string>} - The local URL path
 */
async function uploadToLocal(file, folder) {
  try {
    const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(UPLOAD_DIR, { recursive: true });
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    await writeFile(filePath, buffer);
    return `/uploads/${folder}/${fileName}`;
  } catch (error) {
    console.error("Local storage error:", error);
    return null;
  }
}

/**
 * Unified file saving utility.
 * @param {File|string} file - The file object or existing URL
 * @param {string} folder - The folder name (e.g., 'products', 'categories')
 * @returns {Promise<string>} - The saved file URL
 */
export async function saveFile(file, folder = "products") {
  // If it's already a URL (string) or empty, return it as is
  if (!file || typeof file === 'string') return file;
  
  // Choose storage based on environment
  if (process.env.NODE_ENV === 'production') {
    return await uploadToCloudinary(file, folder);
  } else {
    return await uploadToLocal(file, folder);
  }
}
