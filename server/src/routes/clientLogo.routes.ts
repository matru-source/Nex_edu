import { Router } from 'express';
import { verifyUser } from '@/middlewares/auth.middleware';
import {
    getClientLogosController,
    getAllClientLogosController,
    createClientLogoController,
    updateClientLogoController,
    deleteClientLogoController,
    reorderClientLogosController,
} from '@/controllers/clientLogo.controller';

const router = Router();

// Public route - Get active client logos
router.get('/list', getClientLogosController);

// Admin routes
router.get('/all', verifyUser('ADMIN'), getAllClientLogosController);
router.post('/create', verifyUser('ADMIN'), createClientLogoController);
router.put('/:id', verifyUser('ADMIN'), updateClientLogoController);
router.delete('/:id', verifyUser('ADMIN'), deleteClientLogoController);
router.post('/reorder', verifyUser('ADMIN'), reorderClientLogosController);

export default router;
