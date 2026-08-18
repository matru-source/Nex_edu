import { AppError } from "@/utils/error/errors";
import { prisma } from "@/utils/prisma";
import { CartItem, CourseStatus } from "@prisma/client";

export async function addToCartService(
    userId: string,
    chapterId: string
): Promise<CartItem> {
    // Check if chapter exists and is published
    const chapter = await prisma.chapters.findUnique({
        where: { id: chapterId },
    });

    if (!chapter) {
        throw new AppError("Chapter not found", 404);
    }

    if (chapter.status !== CourseStatus.PUBLISHED) {
        throw new AppError("Chapter is not available", 400);
    }

    // Check if user already purchased this chapter
    const existingPurchase = await prisma.purchase.findFirst({
        where: {
            userId: userId,
            chapterId: chapterId,
            isActive: true,
        },
    });

    if (existingPurchase) {
        throw new AppError("Chapter already purchased", 400);
    }

    // Check if already in cart
    const existingCartItem = await prisma.cartItem.findUnique({
        where: {
            userId_chapterId: {
                userId: userId,
                chapterId: chapterId,
            },
        },
    });

    if (existingCartItem) {
        throw new AppError("Chapter already in cart", 400);
    }

    // Add to cart
    const cartItem = await prisma.cartItem.create({
        data: {
            userId,
            chapterId,
        },
    });

    return cartItem;
}

export async function removeFromCartService(
    userId: string,
    chapterId: string
): Promise<void> {
    const cartItem = await prisma.cartItem.findUnique({
        where: {
            userId_chapterId: {
                userId: userId,
                chapterId: chapterId,
            },
        },
    });

    if (!cartItem) {
        throw new AppError("Item not found in cart", 404);
    }

    await prisma.cartItem.delete({
        where: {
            id: cartItem.id,
        },
    });
}

export async function getCartService(userId: string) {
    const cartItems = await prisma.cartItem.findMany({
        where: {
            userId: userId,
            isActive: true,
        },
        include: {
            chapter: {
                include: {
                    module: {
                        include: {
                            expertise: {
                                include: {
                                    skillCategory: {
                                        include: {
                                            course: {
                                                include: {
                                                    category: true,
                                                    subCategory: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return cartItems;
}

export async function getCartCountService(userId: string): Promise<number> {
    const count = await prisma.cartItem.count({
        where: {
            userId: userId,
            isActive: true,
        },
    });

    return count;
}

export async function getCartTotalService(userId: string): Promise<number> {
    const cartItems = await prisma.cartItem.findMany({
        where: {
            userId: userId,
            isActive: true,
        },
        include: {
            chapter: {
                select: {
                    price: true,
                },
            },
        },
    });

    const total = cartItems.reduce((sum, item) => sum + item.chapter.price, 0);
    return total;
}

export async function clearCartService(userId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
        where: {
            userId: userId,
        },
    });
}

export async function checkoutCartService(userId: string) {
    // Get all cart items with chapter info
    const cartItems = await prisma.cartItem.findMany({
        where: {
            userId: userId,
            isActive: true,
        },
        include: {
            chapter: {
                include: {
                    module: {
                        include: {
                            expertise: {
                                include: {
                                    skillCategory: {
                                        include: {
                                            course: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (cartItems.length === 0) {
        throw new AppError("Cart is empty", 400);
    }

    // Check if any items are already purchased
    const chapterIds = cartItems.map((item) => item.chapterId);
    const existingPurchases = await prisma.purchase.findMany({
        where: {
            userId: userId,
            chapterId: { in: chapterIds },
            isActive: true,
        },
    });

    if (existingPurchases.length > 0) {
        throw new AppError(
            `Some chapters are already purchased: ${existingPurchases.length} item(s)`,
            400
        );
    }

    // Create purchases for all cart items
    const purchases = await prisma.$transaction(
        cartItems.map((item) =>
            prisma.purchase.create({
                data: {
                    userId: userId,
                    chapterId: item.chapterId,
                    amount: item.chapter.price,
                    courseId:
                        item.chapter.module.expertise.skillCategory.course.id,
                },
            })
        )
    );

    // Clear cart after successful purchase
    await prisma.cartItem.deleteMany({
        where: {
            userId: userId,
        },
    });

    const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.chapter.price,
        0
    );

    return {
        purchases,
        totalAmount,
        itemCount: purchases.length,
    };
}

export async function isInCartService(
    userId: string,
    chapterId: string
): Promise<boolean> {
    const cartItem = await prisma.cartItem.findUnique({
        where: {
            userId_chapterId: {
                userId: userId,
                chapterId: chapterId,
            },
        },
    });

    return !!cartItem;
}
