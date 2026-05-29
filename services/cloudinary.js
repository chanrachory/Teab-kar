// services/cloudinary.js

/**
 * Cloudinary Configuration
 * Replace 'YOUR_CLOUD_NAME' with your actual Cloudinary cloud name.
 */
const CLOUD_NAME = "dk8s69zam";
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_DELETE_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`;

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate a Cloudinary URL with transformations
 * @param {string} publicId - The public ID of the image in Cloudinary
 * @param {Object} options - Transformation options (width, height, crop, format, quality)
 * @returns {string} The formatted Cloudinary URL
 */
export function getImageUrl(publicId, options = {}) {
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

export function previewImage(publicId, options = {}) {
  return getImageUrl(publicId, options);
}

export async function uploadImage(file, uploadPreset = "teabkar_wedding") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  return response.json();
}

export async function deleteImage(publicId, { apiKey, apiSecret }) {
  if (!apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary apiKey and apiSecret are required to delete an image.",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await sha256Hex(
    `public_id=${encodeURIComponent(publicId)}&timestamp=${timestamp}${apiSecret}`,
  );

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);

  const response = await fetch(CLOUDINARY_DELETE_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary delete failed: ${text}`);
  }

  return response.json();
}

/**
 * Example pre-wedding gallery images
 * Replace these public IDs with the ones from your Cloudinary account
 */
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
