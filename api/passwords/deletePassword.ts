import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "../tools/authenticateJWT";

export const deletePassword = async (req: Request, res: Response) => {
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

        const passwordResult = await sql`
            SELECT * FROM snp_passwords WHERE id = ${id} AND userId = ${userId};
        `;

        if (passwordResult.rows.length === 0) {
            return res.status(404).json({ message: "Password not found" });
        }

        await sql`
            DELETE FROM snp_passwords WHERE id = ${id} AND userId = ${userId};
        `;

        res.status(200).json({ message: "Password deleted successfully" });
    } catch (err) {
        console.error("Error deleting password:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};