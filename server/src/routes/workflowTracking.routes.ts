import { Router } from 'express';
import { verifyUser } from '@/middlewares/auth.middleware';
import {
    getWorkflowHistoryController,
    getAllWorkflowsController,
    getWorkflowStatsController,
    getEntityDetailsController,
} from '@/controllers/workflowTracking.controller';

const router = Router();

// Get all workflows (admin/moderator only)
router.get('/workflows', verifyUser('ADMIN'), getAllWorkflowsController);

// Get workflow statistics (admin only)
router.get('/workflows/stats', verifyUser('ADMIN'), getWorkflowStatsController);

// Get workflow history for specific entity
router.get(
    '/workflows/:entityType/:entityId',
    verifyUser('ADMIN'),
    getWorkflowHistoryController
);

// Get entity details
router.get(
    '/entity/:entityType/:entityId',
    verifyUser('ADMIN'),
    getEntityDetailsController
);

export default router;