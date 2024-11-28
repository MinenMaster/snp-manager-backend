import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { sql } from "@vercel/postgres";
import { getCurrentTimestampISO } from "./tools/timestamp";
import { createSettings } from "./settings";

export const registerUser = async (req: Request, res: Response) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res
            .status(400)
            .json({ message: "Username, password and email are required" });
    }

    try {
        const existingUser =
            await sql`SELECT * FROM snp_users WHERE username = ${username} OR email = ${email}`;
        if (existingUser.rows.length > 0) {
            return res
                .status(400)
                .json({ message: "Username or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const currentTimestampISO = getCurrentTimestampISO();

        await sql`INSERT INTO snp_users (username, hashed_password, email, createdAt) VALUES (${username}, ${hashedPassword}, ${email}, ${currentTimestampISO})`;

        await createSettings(username);

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
