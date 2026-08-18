import { Router } from 'express';
import { verifyUser } from '@/middlewares/auth.middleware';
import {
  getBannersController,
  getAllBannersController,
  createBannerController,
  updateBannerController,
  deleteBannerController,
  reorderBannersController,
  getStandardSizeController,
} from '@/controllers/banner.controller';

const router = Router();

// Public route - Get active banners for carousel
router.get('/list', getBannersController);

// Public route - Get standard banner size
router.get('/standard-size', getStandardSizeController);

// Admin routes
router.get('/all', verifyUser('ADMIN'), getAllBannersController);
router.post('/create', verifyUser('ADMIN'), createBannerController);
router.put('/:id', verifyUser('ADMIN'), updateBannerController);
router.delete('/:id', verifyUser('ADMIN'), deleteBannerController);
router.post('/reorder', verifyUser('ADMIN'), reorderBannersController);

export default router;
