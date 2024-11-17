import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "./authenticateJWT";
import { encrypt } from "./encryption";

export const updatePassword = async (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (!user) return;

    const { id } = req.params;
    const { title, username, password, url, notes, categoryId } = req.body;

    try {
        const userIdResult = await sql`
            SELECT id FROM snp_users WHERE username = ${user.username};
        `;
        const userId = userIdResult.rows[0]?.id;

        if (!userId) {
            return res.status(404).json({ message: "User not found" });
        }

        // Dynamische Updates mit vorbereiteten Feldern
        const updates = [];
        if (title !== undefined) updates.push(sql`title = ${title}`);
        if (username !== undefined) updates.push(sql`username = ${username}`);
        if (password !== undefined)
            updates.push(sql`password = ${encrypt(password)}`);
        if (url !== undefined) updates.push(sql`url = ${url}`);
        if (notes !== undefined) updates.push(sql`notes = ${notes}`);
        if (categoryId !== undefined)
            updates.push(sql`"categoryId" = ${categoryId}`);

        if (updates.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const query = sql`
            UPDATE snp_passwords
            SET ${sql.join(updates, sql`, `)}
            WHERE id = ${id} AND userId = ${userId};
        `;

        const result = await query;

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Password not found" });
        }

        return res
            .status(200)
            .json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error updating password:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
