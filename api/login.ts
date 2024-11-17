import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sql } from "@vercel/postgres";
import { timestampISO, timestampFormatted } from "./timestamp";

const JWT_SECRET = process.env.JWT_SECRET;

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Username and password are required" });
    }

    const { rows } =
        await sql`SELECT * FROM snp_users WHERE username = ${username};`;

    if (rows.length > 0) {
        const user = rows[0];
        const isValidPassword = await bcrypt.compare(
            password,
            user.hashed_password
        );

        if (isValidPassword) {
            const token = jwt.sign({ username: user.username }, JWT_SECRET, {
                expiresIn: "1h",
            });

            await logLogin(user.username);

            res.json({ token });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
};

const logLogin = async (username: string) => {
    console.log(`[${timestampFormatted}] User ${username} logged in.`);

    try {
        await sql`INSERT INTO snp_login_logs (username, timestamp) VALUES (${username}, ${timestampISO});`;
    } catch (err) {
        console.error("Error logging login to database:", err);
    }
};
