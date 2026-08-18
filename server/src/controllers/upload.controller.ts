import { Request, Response } from 'express';
import { generateUploadSignature } from '@/utils/cloudinary/cloudinary';

export async function getPreSignedUrl(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { fileName, fileType, folder } = req.query;
    
    let resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto';
    if (typeof fileType === 'string') {
      if (fileType.startsWith('image/')) {
        resourceType = 'image';
      } else if (fileType.startsWith('video/') || fileType.startsWith('audio/')) {
        resourceType = 'video';
      } else if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('sheet') || fileType.includes('zip')) {
        resourceType = 'auto';
      }
    }

    const uploadParams = generateUploadSignature({
      folder: (folder as string) || 'erp-bugs',
      resourceType,
    });

    return res.status(200).json({
      status: true,
      ...uploadParams,
    });
  } catch (e: any) {
    console.error('Error generating upload signature:', e);
    return res.status(500).json({
      status: false,
      msg: 'internal server error!',
      log: e.message || 'error generating upload signature',
    });
  }
}

export const getCloudinarySignature = getPreSignedUrl;