/**
 * Custom Next.js Image loader for Cloudinary.
 *
 * For Cloudinary URLs: applies Cloudinary's own transformation params
 * (quality, width) directly in the CDN URL — no proxy through Next.js.
 *
 * For local /public assets: returns the src as-is (standard browser behaviour).
 */
export default function cloudinaryLoader({ src, width, quality }) {
  // Pass through empty, non-string, or local/non-Cloudinary images unchanged
  if (typeof src !== 'string' || !src || !src.includes('res.cloudinary.com')) {
    return src;
  }

  // Do not transform video URLs or non-upload paths with image parameters
  if (
    src.includes('/video/') ||
    /\.(mp4|webm|ogg|mov)$/i.test(src) ||
    !src.includes('/upload/')
  ) {
    return src;
  }

  // If transformations are already present after /upload/, avoid duplicate injection
  if (/\/upload\/[a-z]_[^/]+\//.test(src)) {
    return src;
  }

  // Build a Cloudinary transformation string and inject it into the URL.
  // Cloudinary URL format:
  //   https://res.cloudinary.com/<cloud>/image/upload/<transformations>/<version>/<path>
  const q = quality || 75;
  const transforms = `w_${width},q_${q},f_auto`;

  // Insert transformations after /upload/
  return src.replace('/upload/', `/upload/${transforms}/`);
}

