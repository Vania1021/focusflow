import { Router } from "express";
import { login, logout, register } from "../controllers/auth.controller";

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

export default router;
