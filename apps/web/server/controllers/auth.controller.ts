import { Request, Response } from "express";
import { UserContainer } from "../lib/db.config";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { generateToken } from "../utils/util";

export const register = async (req: Request, res: Response) => {
    const { email, password, fullName } = req.body;
    console.log(`[Auth] Registering user: ${email}`);

    try {
        if (!email || !fullName || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Use a query to check for existing user since the item ID is a UUID, not the email
        const query = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }],
        };
        const { resources } = await UserContainer.items.query<User>(query).fetchAll();

        if (resources.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const now = new Date().toISOString();

        const newUser: User = {
            id: uuid(),
            email,
            name: fullName,
            passwordHash,
            authProvider: "local",
            previousContentList: [],
            createdAt: now,
            lastLogin: now,
            type: "USER",
        };

        await UserContainer.items.create(newUser);

        generateToken(newUser.id, res);

        // Remove passwordHash before sending the user object to the frontend

        const { passwordHash: _, ...userResponse } = newUser; // Security: remove hash
        res.status(200).json({ 
            user: userResponse, // Send the actual user data
            message: "Registration successful" 
        });

    } catch (error) {
        console.error(`[Auth] Error registering user: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(`[Auth] Logging in user: ${email}`);

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const query = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }],
        };

        const { resources } = await UserContainer.items.query<User>(query).fetchAll();

        if (resources.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = resources[0];

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        generateToken(user.id, res);

        // Sanitize response and return user data for frontend state synchronization
        
        const { passwordHash: _, ...userResponse } = user; // Security: remove hash
        res.status(200).json({ 
            user: userResponse, // Send the actual user data
            message: "Login successful" 
        });
        

    } catch (error) {
        console.error(`[Auth] Error logging in user: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        // Clear the JWT cookie to end the session
        res.clearCookie("jwt");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error(`[Auth] Error logging out user: ${error}`);
        res.status(500).json({ message: "Internal server error" });
    }
}