import { API_ROUTES } from './api';

export interface UploadOptions {
  folder?: string;
  onProgress?: (percent: number) => void;
}

export interface UploadResult {
  fileUrl: string;
  publicId?: string;
  duration?: number;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

/**
 * Upload a file directly to Cloudinary using signed credentials from the backend.
 */
export async function uploadMediaFile(
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const encodedFileName = encodeURIComponent(sanitizedFileName);
  const folderParam = options?.folder ? `&folder=${encodeURIComponent(options.folder)}` : '';

  const signRes = await fetch(
    `${API_ROUTES.UPLOAD.PRE_SIGNED_URL}?fileName=${encodedFileName}&fileType=${file.type}${folderParam}`
  );

  if (!signRes.ok) {
    throw new Error('Failed to obtain Cloudinary upload signature');
  }

  const signData = await signRes.json();
  const { uploadUrl, apiKey, timestamp, signature, folder } = signData;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  if (folder) {
    formData.append('folder', folder);
  }

  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);

    if (options?.onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress?.(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            fileUrl: response.secure_url || response.url,
            publicId: response.public_id,
            duration: response.duration ? Math.round(response.duration) : undefined,
            format: response.format,
            bytes: response.bytes,
            width: response.width,
            height: response.height,
          });
        } catch (e) {
          reject(new Error('Invalid response received from Cloudinary'));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData?.error?.message || 'Cloudinary upload failed'));
        } catch {
          reject(new Error(`Upload failed with HTTP status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during file upload'));
    };

    xhr.send(formData);
  });
}
