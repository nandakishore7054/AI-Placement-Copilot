import { v2 as cloudinary } from "cloudinary";

// ─── Lazy Cloudinary Configuration ───────────────────────────────────────────
// cloudinary.config() is safe with undefined values (it won't throw),
// but we still move it inside a getter to follow the same build-safe pattern
// as email.ts and ensure configuration is validated at runtime only.

let _configured = false;

function getCloudinary() {
  if (!_configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    _configured = true;
  }
  return cloudinary;
}

// ─── Upload Helpers ───────────────────────────────────────────────────────────

interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Uploads a file buffer or base64 string to Cloudinary.
 * Returns the secure URL and public ID.
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder: string;
    publicId?: string;
    resourceType?: "image" | "raw" | "video" | "auto";
    transformation?: object[];
  },
): Promise<UploadResult> {
  const cld = getCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: options.resourceType ?? "auto",
        transformation: options.transformation,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    if (Buffer.isBuffer(file)) {
      uploadStream.end(file);
    } else {
      // base64 data URL — use direct upload API
      cld.uploader
        .upload(file, {
          folder: options.folder,
          public_id: options.publicId,
          resource_type: options.resourceType ?? "auto",
        })
        .then((result) => {
          resolve({ url: result.secure_url, publicId: result.public_id });
        })
        .catch(reject);
    }
  });
}

/**
 * Uploads a company logo to the `logos/` Cloudinary folder.
 */
export async function uploadCompanyLogo(
  file: Buffer | string,
  companyId: string,
): Promise<UploadResult> {
  return uploadToCloudinary(file, {
    folder: "ai-placement-copilot/logos",
    publicId: `company-${companyId}`,
    resourceType: "image",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "auto" },
      { quality: "auto:best", fetch_format: "auto" },
    ],
  });
}

/**
 * Uploads a user resume PDF to the `resumes/` Cloudinary folder.
 */
export async function uploadResumePdf(
  file: Buffer | string,
  userId: string,
): Promise<UploadResult> {
  return uploadToCloudinary(file, {
    folder: "ai-placement-copilot/resumes",
    publicId: `resume-${userId}`,
    resourceType: "raw",
  });
}

/**
 * Deletes a file from Cloudinary by its public ID.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "raw" | "video" = "image",
): Promise<void> {
  const cld = getCloudinary();
  await cld.uploader.destroy(publicId, { resource_type: resourceType });
}

// Export the configured instance for advanced usage
export { cloudinary };
