import { Router } from "express";
import { verifyUser } from "@/middlewares/auth.middleware";
import validateInput from "@/middlewares/inputValidation.middleware";
import {
    createUserController,
    getUsersController,
    getUserByIdController,
    updateUserController,
    deleteUserController,
} from "@/controllers/userManagement.controller";
import {
    CreateUserRequest,
    UpdateUserRequest,
} from "@/types/zod";

const router = Router();

// All routes require ADMIN role
router.post(
    "/users/create",
    verifyUser("ADMIN"),
    validateInput(CreateUserRequest),
    createUserController
);

router.get("/users", verifyUser("ADMIN"), getUsersController);

router.get("/users/:userId", verifyUser("ADMIN"), getUserByIdController);

router.put(
    "/users/:userId",
    verifyUser("ADMIN"),
    validateInput(UpdateUserRequest),
    updateUserController
);

router.delete("/users/:userId", verifyUser("ADMIN"), deleteUserController);

export default router;