// services/cloudinary.js

// Cloudinary configuration
const CLOUD_NAME = "dk8s69zam";
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Default unsigned upload preset (as requested)
const DEFAULT_UPLOAD_PRESET = "wedding_unsigned";

/**
 * Build a Cloudinary URL with optional transformations.
 * publicId can be a Cloudinary public id like "wedding/cover-123"
 */
export function getImageUrl(publicId, options = {}) {
  if (!publicId) return "";
  const {
    width = "auto",
    height,
    crop = "scale",
    format = "auto",
    quality = "auto",
  } = options;
  let transformations = `c_${crop},f_${format},q_${quality}`;
  if (width !== "auto") transformations += `,w_${width}`;
  if (height) transformations += `,h_${height}`;
  return `${BASE_URL}/${transformations}/${publicId}`;
}

/**
 * Preview helper: accepts either a File (from input) or a publicId string.
 * - If File: returns an object URL via URL.createObjectURL(file)
 * - If publicId: returns a transformed Cloudinary URL
 */
export function previewImage(source, options = {}) {
  if (!source) return "";
  // File input preview
  if (source instanceof File) {
    try {
      return URL.createObjectURL(source);
    } catch (err) {
      console.error("previewImage: failed to create object URL", err);
      return "";
    }
  }
  // Assume it's a Cloudinary public id
  return getImageUrl(source, options);
}

/**
 * Upload an image file to Cloudinary using the unsigned upload preset.
 * Returns the parsed JSON response from Cloudinary containing secure_url and public_id.
 */
export async function uploadImage(file, uploadPreset = DEFAULT_UPLOAD_PRESET) {
  if (!file) throw new Error("uploadImage: file is required");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  console.info(
    "Cloudinary: uploading file",
    file.name,
    "preset:",
    uploadPreset,
  );

  const res = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (err) {
    console.error("Cloudinary: invalid JSON response", text);
    throw new Error(
      `Cloudinary upload failed: ${res.status} ${res.statusText}`,
    );
  }

  if (!res.ok) {
    console.error("Cloudinary upload error:", json);
    throw new Error(json.error?.message || "Cloudinary upload failed");
  }

  console.info("Cloudinary upload successful:", json);
  return json; // contains secure_url, public_id, etc.
}

// Note: deleteImage/remove secrets should never be exposed in frontend code.
// Keep frontend surface small: uploadImage, getImageUrl, previewImage.

export const preWeddingImages = [
  "wedding/prewedding-1",
  "wedding/prewedding-2",
  "wedding/prewedding-3",
  "wedding/prewedding-4",
];

export const ceremonyImages = [
  "wedding/ceremony-1",
  "wedding/ceremony-2",
  "wedding/ceremony-3",
];
