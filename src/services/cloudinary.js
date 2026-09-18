// Cloudinary configuration (exact credentials from original codebase)
const CLOUD_NAME = "dk8s69zam";
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Default unsigned upload preset
const DEFAULT_UPLOAD_PRESET = "wedding_unsigned";

/**
 * Build a Cloudinary URL with optional transformations.
 */
export function getImageUrl(publicId, options = {}) {
  if (!publicId) return "";
  if (
    typeof publicId === "string" &&
    (publicId.startsWith("http://") ||
      publicId.startsWith("https://") ||
      publicId.startsWith("data:") ||
      publicId.startsWith("blob:"))
  ) {
    return publicId;
  }
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
 */
export function previewImage(source, options = {}) {
  if (!source) return "";
  if (source instanceof File) {
    try {
      return URL.createObjectURL(source);
    } catch (err) {
      console.error("previewImage: failed to create object URL", err);
      return "";
    }
  }
  return getImageUrl(source, options);
}

/**
 * Upload an image file to Cloudinary using the unsigned upload preset.
 */
export async function uploadImage(file, uploadPreset = DEFAULT_UPLOAD_PRESET) {
  if (!file) throw new Error("uploadImage: file is required");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

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

  return json;
}

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
