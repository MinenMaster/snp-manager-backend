
import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "../tools/authenticateJWT";

export const updateCategory = async (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (!user) return;

    const { id } = req.params;
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

        const categoryResult = await sql`
            SELECT * FROM snp_categories WHERE id = ${id} AND userId = ${userId};
        `;

        if (categoryResult.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        await sql`
            UPDATE snp_categories
            SET name = ${name}
            WHERE id = ${id} AND userId = ${userId};
        `;

        return res.status(200).json({ message: "Category updated successfully" });
    } catch (err) {
        console.error("Error updating category:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};