import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "./authenticateJWT";
import { encrypt } from "./encryption";

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
        const encryptedPassword = encrypt(password);

        await sql`
            INSERT INTO snp_passwords 
                (userId, title, username, password, url, notes, categoryId)
            VALUES 
                (${user.id}, ${title}, ${username}, ${encryptedPassword}, ${url}, ${notes}, ${categoryId});
        `;

        res.status(201).json({ message: "Password created successfully" });
    } catch (err) {
        console.error("Error creating password:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
