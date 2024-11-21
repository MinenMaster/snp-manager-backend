
import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "../tools/authenticateJWT";

export const createCategory = async (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (!user) return;

    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Category name is required" });
    }

    try {
        const userIdResult = await sql`
            SELECT id FROM snp_users WHERE username = ${user.username};
        `;
        const userId = userIdResult.rows[0].id;

        if (!userId) {
            return res.status(404).json({ message: "User not found" });
        }

        await sql`
            INSERT INTO snp_categories (userId, name)
            VALUES (${userId}, ${name});
        `;

        return res.status(201).json({ message: "Category created successfully" });
    } catch (err) {
        console.error("Error creating category:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};