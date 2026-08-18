import { Request, Response } from "express";
import { errorHandler } from "@/utils/error";
import {
    addToCartService,
    removeFromCartService,
    getCartService,
    getCartCountService,
    getCartTotalService,
    clearCartService,
    checkoutCartService,
    isInCartService,
} from "@/services/cart.service";

export async function addToCartController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { chapterId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!chapterId) {
            return res.status(400).json({
                success: false,
                message: "Chapter ID is required",
            });
        }

        const cartItem = await addToCartService(userId, chapterId);

        return res.status(201).json({
            success: true,
            message: "Chapter added to cart",
            data: cartItem,
        });
    } catch (err) {
        return errorHandler(err, "Error in addToCartController", res);
    }
}

export async function removeFromCartController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { chapterId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!chapterId) {
            return res.status(400).json({
                success: false,
                message: "Chapter ID is required",
            });
        }

        await removeFromCartService(userId, chapterId);

        return res.status(200).json({
            success: true,
            message: "Chapter removed from cart",
        });
    } catch (err) {
        return errorHandler(err, "Error in removeFromCartController", res);
    }
}

export async function getCartController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const cartItems = await getCartService(userId);
        const total = await getCartTotalService(userId);

        return res.status(200).json({
            success: true,
            message: "Cart retrieved successfully",
            data: {
                items: cartItems,
                total: total,
                itemCount: cartItems.length,
            },
        });
    } catch (err) {
        return errorHandler(err, "Error in getCartController", res);
    }
}

export async function getCartCountController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const count = await getCartCountService(userId);

        return res.status(200).json({
            success: true,
            message: "Cart count retrieved successfully",
            data: { count },
        });
    } catch (err) {
        return errorHandler(err, "Error in getCartCountController", res);
    }
}

export async function clearCartController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await clearCartService(userId);

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
        });
    } catch (err) {
        return errorHandler(err, "Error in clearCartController", res);
    }
}

export async function checkoutCartController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const result = await checkoutCartService(userId);

        return res.status(200).json({
            success: true,
            message: `Successfully purchased ${result.itemCount} chapter(s)`,
            data: result,
        });
    } catch (err) {
        return errorHandler(err, "Error in checkoutCartController", res);
    }
}

export async function checkInCartController(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const { chapterId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!chapterId) {
            return res.status(400).json({
                success: false,
                message: "Chapter ID is required",
            });
        }

        const isInCart = await isInCartService(userId, chapterId);

        return res.status(200).json({
            success: true,
            message: "Cart status retrieved successfully",
            data: { isInCart },
        });
    } catch (err) {
        return errorHandler(err, "Error in checkInCartController", res);
    }
}
