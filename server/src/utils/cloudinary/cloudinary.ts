import { v2 as cloudinary } from 'cloudinary';
import { config } from '@/config';

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

export interface SignedUploadParams {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  cloudName: string;
  resourceType: 'auto' | 'image' | 'video' | 'raw';
}

/**
 * Generate signed upload parameters for direct client-to-Cloudinary upload.
 */
export function generateUploadSignature(options?: {
  folder?: string;
  resourceType?: 'auto' | 'image' | 'video' | 'raw';
}): SignedUploadParams {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = options?.folder || 'erp-bugs';
  const resourceType = options?.resourceType || 'auto';

  // Parameters to sign (sorted alphabetically by key)
  const paramsToSign: Record<string, any> = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    config.cloudinary.apiSecret
  );

  const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/${resourceType}/upload`;

  return {
    uploadUrl,
    apiKey: config.cloudinary.apiKey,
    timestamp,
    signature,
    folder,
    cloudName: config.cloudinary.cloudName,
    resourceType,
  };
}

/**
 * Upload an asset (file path, URL, or base64) directly to Cloudinary from the backend.
 */
export async function uploadToCloudinary(
  fileSource: string,
  options?: {
    folder?: string;
    resourceType?: 'auto' | 'image' | 'video' | 'raw';
    publicId?: string;
  }
) {
  return await cloudinary.uploader.upload(fileSource, {
    folder: options?.folder || 'erp-bugs',
    resource_type: options?.resourceType || 'auto',
    public_id: options?.publicId,
    use_filename: true,
    unique_filename: true,
    overwrite: true,
  });
}

export { cloudinary };
