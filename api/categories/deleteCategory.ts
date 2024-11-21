
import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "../tools/authenticateJWT";

export const deleteCategory = async (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (!user) return;

    const { id } = req.params;

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
            DELETE FROM snp_categories WHERE id = ${id} AND userId = ${userId};
        `;

        return res.status(200).json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error("Error deleting category:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};