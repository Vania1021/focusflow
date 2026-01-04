import jwt from "jsonwebtoken";
import { Response } from "express";

export const generateToken = (userId: string, res: Response) => {
    const token = jwt.sign({userId},process.env.JWT_SECRET!,{expiresIn:"7d"});
    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" as const : "lax" as const,
        maxAge: 7 * 24 * 60 * 60 * 1000
    };

    console.log("Token generated successfully");
    res.cookie("jwt", token, cookieOptions);
    return token;
}