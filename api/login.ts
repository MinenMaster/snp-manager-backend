import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sql } from "@vercel/postgres";
import {
    getCurrentTimestampISO,
    getCurrentTimestampFormatted,
} from "./tools/timestamp";

const JWT_SECRET = process.env.JWT_SECRET;

export const loginUser = async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res
            .status(400)
            .json({ message: "Identifier and password are required" });
    }

    try {
        const { rows } =
            await sql`SELECT * FROM snp_users WHERE username = ${identifier} OR email = ${identifier}`;

        if (rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = rows[0];

        const validPassword = await bcrypt.compare(
            password,
            user.hashed_password
        );
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const currentTimestampISO = getCurrentTimestampISO();
        await sql`UPDATE snp_users SET lastLogin = ${currentTimestampISO} WHERE id = ${user.id}`;

        const token = jwt.sign({ username: user.username }, JWT_SECRET, {
            expiresIn: "1h",
        });

        await logLogin(user.username);

        res.json({ token });
    } catch (err) {
        console.error("Error logging in user:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const logLogin = async (username: string) => {
    const currentTimestampFormatted = getCurrentTimestampFormatted();
    console.log(`[${currentTimestampFormatted}] User ${username} logged in.`);

    try {
        const currentTimestampISO = getCurrentTimestampISO();
        await sql`INSERT INTO snp_login_logs (username, timestamp) VALUES (${username}, ${currentTimestampISO});`;
    } catch (err) {
        console.error("Error logging login to database:", err);
    }
};
