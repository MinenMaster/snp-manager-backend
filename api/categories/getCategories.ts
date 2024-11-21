import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "../tools/authenticateJWT";

export const getCategories = async (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (!user) return;

    try {
        const userIdResult = await sql`
            SELECT id FROM snp_users WHERE username = ${user.username};
        `;
        const userId = userIdResult.rows[0].id;

        if (!userId) {
            return res.status(404).json({ message: "User not found" });
        }

        const { rows } = await sql`
            SELECT id, name FROM snp_categories WHERE userId = ${userId};
        `;

        // if no categories are found, return an empty array
        if (rows.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
