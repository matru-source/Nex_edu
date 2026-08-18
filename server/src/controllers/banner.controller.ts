import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Standard banner dimensions
export const BANNER_STANDARD_WIDTH = 1920;
export const BANNER_STANDARD_HEIGHT = 500;

// Get all active banners (public)
export async function getBannersController(req: Request, res: Response): Promise<Response> {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return res.status(200).json({
      status: true,
      data: banners,
      standardSize: {
        width: BANNER_STANDARD_WIDTH,
        height: BANNER_STANDARD_HEIGHT,
      },
    });
  } catch (error) {
    console.error('Error getting banners:', error);
    return res.status(500).json({
      status: false,
      msg: 'Internal server error',
    });
  }
}

// Get all banners including inactive (admin only)
export async function getAllBannersController(req: Request, res: Response): Promise<Response> {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });

    return res.status(200).json({
      status: true,
      data: banners,
      standardSize: {
        width: BANNER_STANDARD_WIDTH,
        height: BANNER_STANDARD_HEIGHT,
      },
    });
  } catch (error) {
    console.error('Error getting all banners:', error);
    return res.status(500).json({
      status: false,
      msg: 'Internal server error',
    });
  }
}

// Create a new banner
export async function createBannerController(req: Request, res: Response): Promise<Response> {
  try {
    const { imageUrl, title, description, width, height } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        status: false,
        msg: 'Image URL is required',
      });
    }

    // Get the highest order value
    const maxOrderBanner = await prisma.banner.findFirst({
      orderBy: { order: 'desc' },
    });
    const nextOrder = (maxOrderBanner?.order || 0) + 1;

    const banner = await prisma.banner.create({
      data: {
        imageUrl,
        title: title || null,
        description: description || null,
        order: nextOrder,
        isActive: true,
        width: width || BANNER_STANDARD_WIDTH,
        height: height || BANNER_STANDARD_HEIGHT,
      },
    });

    return res.status(201).json({
      status: true,
      msg: 'Banner created successfully',
      data: banner,
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    return res.status(500).json({
      status: false,
      msg: 'Internal server error while creating banner',
    });
  }
}

// Update a banner
export async function updateBannerController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const { imageUrl, title, description, order, isActive, width, height } = req.body;

    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return res.status(404).json({
        status: false,
        msg: 'Banner not found',
      });
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        imageUrl: imageUrl !== undefined ? imageUrl : existingBanner.imageUrl,
        title: title !== undefined ? title : existingBanner.title,
        description: description !== undefined ? description : existingBanner.description,
        order: order !== undefined ? order : existingBanner.order,
        isActive: isActive !== undefined ? isActive : existingBanner.isActive,
        width: width !== undefined ? width : existingBanner.width,
        height: height !== undefined ? height : existingBanner.height,
      },
    });

    return res.status(200).json({
      status: true,
      msg: 'Banner updated successfully',
      data: banner,
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return res.status(500).json({
      status: false,
      msg: 'Internal server error while updating banner',
    });
  }
}

// Delete a banner
export async function deleteBannerController(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;

    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      return res.status(404).json({
        status: false,
        msg: 'Banner not found',
      });
    }

    await prisma.banner.delete({
      where: { id },
    });

    return res.status(200).json({
      status: true,
      msg: 'Banner deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return res.status(500).json({
      status: false,
      msg: 'Internal server error while deleting banner',
    });
  }
}

// Reorder banners
export async function reorderBannersController(req: Request, res: Response): Promise<Response> {
  try {
    const { bannerIds } = req.body;

    if (!Array.isArray(bannerIds)) {
      return res.status(400).json({
        status: false,
        msg: 'bannerIds must be an array',
      });
    }

    // Update order for each banner
    for (let i = 0; i < bannerIds.length; i++) {
      await prisma.banner.update({
        where: { id: bannerIds[i] },
        data: { order: i },
      });
    }

    return res.status(200).json({
      status: true,
      msg: 'Banners reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering banners:', error);
    return res.status(500).json({
      status: false,
      msg: 'Internal server error while reordering banners',
    });
  }
}

// Get standard banner size
export async function getStandardSizeController(req: Request, res: Response): Promise<Response> {
  return res.status(200).json({
    status: true,
    data: {
      width: BANNER_STANDARD_WIDTH,
      height: BANNER_STANDARD_HEIGHT,
      aspectRatio: `${BANNER_STANDARD_WIDTH}:${BANNER_STANDARD_HEIGHT}`,
      message: `Recommended banner size is ${BANNER_STANDARD_WIDTH}x${BANNER_STANDARD_HEIGHT} pixels (approximately 4:1 aspect ratio)`,
    },
  });
}
