import { Router } from "express";
import { verifyUser } from "@/middlewares/auth.middleware";
import {
    addToCartController,
    removeFromCartController,
    getCartController,
    getCartCountController,
    clearCartController,
    checkoutCartController,
    checkInCartController,
} from "@/controllers/cart.controller";

const router = Router();

router.post("/add", verifyUser("STUDENT"), addToCartController);
router.delete("/remove/:chapterId", verifyUser("STUDENT"), removeFromCartController);
router.get("/", verifyUser("STUDENT"), getCartController);
router.get("/count", verifyUser("STUDENT"), getCartCountController);
router.delete("/clear", verifyUser("STUDENT"), clearCartController);
router.post("/checkout", verifyUser("STUDENT"), checkoutCartController);
router.get("/check/:chapterId", verifyUser("STUDENT"), checkInCartController);

export default router;
