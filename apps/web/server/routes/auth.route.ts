import { Router } from "express";
import { login, logout, register, checkAuth } from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.middleware";

const router = Router();

/**
 * REGISTER
 */
router.post("/register", register );

/**
 * LOGIN
 */
router.post("/login", login);

/**
 * LOGOUT
 */
router.post("/logout", logout)

/**
 * CHECK AUTH
 */
router.get("/check", protectRoute ,checkAuth)

export default router;
