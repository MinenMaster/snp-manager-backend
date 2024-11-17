import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { sql } from "@vercel/postgres";

export const registerUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Username and password are required" });
    }

    try {
        const existingUser =
            await sql`SELECT * FROM snp_users WHERE username = ${username}`;
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await sql`INSERT INTO snp_users (username, hashed_password) VALUES (${username}, ${hashedPassword})`;

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
