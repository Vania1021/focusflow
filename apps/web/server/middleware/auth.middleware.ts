import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { UserContainer } from "../lib/db.config";

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        // Fetch user from Cosmos DB
        const existingUser = await UserContainer.item(decoded.userId, decoded.userId).read();

        if (!existingUser.resource) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }

        // Attach user object to the request for the controller
        req.user = existingUser.resource;
        next();
    } catch (error) {
        console.error("[Auth Middleware Error]:", error);
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
}