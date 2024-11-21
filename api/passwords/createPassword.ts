import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "../tools/authenticateJWT";
import { encrypt } from "../tools/encryption";

export const createPassword = async (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (!user) return;

    const { title, username, password, url, notes, categoryId } = req.body;

    if (!title || !password) {
        return res
            .status(400)
            .json({ message: "Title and password are required" });
    }

    try {
        const userIdResult = await sql`
            SELECT id FROM snp_users WHERE username = ${user.username};
        `;
        const userId = userIdResult.rows[0].id;

        if (!userId) {
            return res.status(404).json({ message: "User not found" });
        }

        const encryptedPassword = encrypt(password);

        await sql`
            INSERT INTO snp_passwords 
                (userId, title, username, password, url, notes, categoryId)
            VALUES 
                (${userId}, ${title}, ${username}, ${encryptedPassword}, ${url}, ${notes}, ${categoryId});
        `;

        return res
            .status(201)
            .json({ message: "Password created successfully" });
    } catch (err) {
        console.error("Error creating password:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
