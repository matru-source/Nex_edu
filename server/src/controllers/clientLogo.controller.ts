import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all active client logos (public)
export async function getClientLogosController(req: Request, res: Response): Promise<Response> {
    try {
        const logos = await prisma.clientLogo.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });

        return res.status(200).json({
            status: true,
            data: logos,
        });
    } catch (error) {
        console.error('Error getting client logos:', error);
        return res.status(500).json({
            status: false,
            msg: 'Internal server error',
        });
    }
}

// Get all client logos including inactive (admin only)
export async function getAllClientLogosController(req: Request, res: Response): Promise<Response> {
    try {
        const logos = await prisma.clientLogo.findMany({
            orderBy: { order: 'asc' },
        });

        return res.status(200).json({
            status: true,
            data: logos,
        });
    } catch (error) {
        console.error('Error getting all client logos:', error);
        return res.status(500).json({
            status: false,
            msg: 'Internal server error',
        });
    }
}

// Create a new client logo
export async function createClientLogoController(req: Request, res: Response): Promise<Response> {
    try {
        const { imageUrl, name, width, height } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                status: false,
                msg: 'Image URL is required',
            });
        }

        // Get the highest order value
        const maxOrderLogo = await prisma.clientLogo.findFirst({
            orderBy: { order: 'desc' },
        });
        const nextOrder = (maxOrderLogo?.order || 0) + 1;

        const logo = await prisma.clientLogo.create({
            data: {
                imageUrl,
                name: name || null,
                order: nextOrder,
                isActive: true,
                width: width || null,
                height: height || null,
            },
        });

        return res.status(201).json({
            status: true,
            msg: 'Client logo created successfully',
            data: logo,
        });
    } catch (error) {
        console.error('Error creating client logo:', error);
        return res.status(500).json({
            status: false,
            msg: 'Internal server error while creating client logo',
        });
    }
}

// Update a client logo
export async function updateClientLogoController(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const { imageUrl, name, order, isActive, width, height } = req.body;

        const existingLogo = await prisma.clientLogo.findUnique({
            where: { id },
        });

        if (!existingLogo) {
            return res.status(404).json({
                status: false,
                msg: 'Client logo not found',
            });
        }

        const logo = await prisma.clientLogo.update({
            where: { id },
            data: {
                imageUrl: imageUrl !== undefined ? imageUrl : existingLogo.imageUrl,
                name: name !== undefined ? name : existingLogo.name,
                order: order !== undefined ? order : existingLogo.order,
                isActive: isActive !== undefined ? isActive : existingLogo.isActive,
                width: width !== undefined ? width : existingLogo.width,
                height: height !== undefined ? height : existingLogo.height,
            },
        });

        return res.status(200).json({
            status: true,
            msg: 'Client logo updated successfully',
            data: logo,
        });
    } catch (error) {
        console.error('Error updating client logo:', error);
        return res.status(500).json({
            status: false,
            msg: 'Internal server error while updating client logo',
        });
    }
}

// Delete a client logo
export async function deleteClientLogoController(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;

        const existingLogo = await prisma.clientLogo.findUnique({
            where: { id },
        });

        if (!existingLogo) {
            return res.status(404).json({
                status: false,
                msg: 'Client logo not found',
            });
        }

        await prisma.clientLogo.delete({
            where: { id },
        });

        return res.status(200).json({
            status: true,
            msg: 'Client logo deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting client logo:', error);
        return res.status(500).json({
            status: false,
            msg: 'Internal server error while deleting client logo',
        });
    }
}

// Reorder client logos
export async function reorderClientLogosController(req: Request, res: Response): Promise<Response> {
    try {
        const { logoIds } = req.body;

        if (!Array.isArray(logoIds)) {
            return res.status(400).json({
                status: false,
                msg: 'logoIds must be an array',
            });
        }

        // Update order for each logo
        for (let i = 0; i < logoIds.length; i++) {
            await prisma.clientLogo.update({
                where: { id: logoIds[i] },
                data: { order: i },
            });
        }

        return res.status(200).json({
            status: true,
            msg: 'Client logos reordered successfully',
        });
    } catch (error) {
        console.error('Error reordering client logos:', error);
        return res.status(500).json({
            status: false,
            msg: 'Internal server error while reordering client logos',
        });
    }
}
