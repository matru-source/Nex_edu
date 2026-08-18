import { getPreSignedUrl, getCloudinarySignature } from '@/controllers/upload.controller';
import { Router } from 'express';

const router = Router();

router.get('/presigned', getPreSignedUrl);
router.get('/signature', getCloudinarySignature);

export default router;