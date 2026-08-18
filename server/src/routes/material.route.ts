import { Router } from 'express';
import { verifyUser } from '@/middlewares/auth.middleware';
import validateInput from '@/middlewares/inputValidation.middleware';
import {
    createMaterialController,
    getMaterialsByLevelController,
    getMaterialsByCoursePathController,
    getMaterialByIdController,
    updateMaterialController,
    deleteMaterialController,
    getMaterialsByTypeController,
    getRequiredMaterialsController,
} from '@/controllers/material.controller';
import {
    CreateMaterialRequest,
    UpdateMaterialRequest,
    GetMaterialsByLevelRequest,
} from '@/types/zod';

const router = Router();

// Create material (Admin only)
router.post('/create', verifyUser('ADMIN'), validateInput(CreateMaterialRequest), createMaterialController);

// Get materials by level (with filters)
router.get('/level', getMaterialsByLevelController);

// Get materials by course path (hierarchical)
router.get('/course/:courseId/path', verifyUser('STUDENT'), getMaterialsByCoursePathController);

// Get single material
router.get('/:materialId', getMaterialByIdController);

// Update material (Admin only)
router.put('/:materialId', verifyUser('ADMIN'), validateInput(UpdateMaterialRequest), updateMaterialController);

// Delete material (Admin only)
router.delete('/:materialId', verifyUser('ADMIN'), deleteMaterialController);

// Get materials by type
router.get('/type/:materialType', getMaterialsByTypeController);

// Get required materials
router.get('/required', getRequiredMaterialsController);

export default router;