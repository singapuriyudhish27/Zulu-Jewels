import { v2 as cloudinary } from 'cloudinary';

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
  let buffer;
  if (typeof file === 'string' && file.startsWith('data:')) {
    const base64Data = file.split(',')[1];
    buffer = Buffer.from(base64Data, 'base64');
  } else {
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
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
    return file;
  }
  
  // Choose storage - Now always using Cloudinary for both dev and prod
  return await uploadToCloudinary(file, folder);
}
