import { Router } from 'express';
import { getSuccessStoriesController } from '@/controllers/studentStories.controller';

const router = Router();

// Public route to get success stories
router.get('/list', getSuccessStoriesController);

export default router;
