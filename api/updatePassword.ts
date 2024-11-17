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
        const userId = userIdResult.rows[0].id;

        if (!userId) {
            return res.status(404).json({ message: "User not found" });
        }

        const updates: { [key: string]: any } = {};
        if (title !== undefined) updates.title = title;
        if (username !== undefined) updates.username = username;
        if (password !== undefined) updates.password = encrypt(password);
        if (url !== undefined) updates.url = url;
        if (notes !== undefined) updates.notes = notes;
        if (categoryId !== undefined) updates.categoryId = categoryId;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const updatedPassword = await sql`
            UPDATE snp_passwords
            SET ${Object.keys(updates)
                .map((key) => `${key} = ${sql`${updates[key]}`}`)
                .join(", ")}
            WHERE id = ${id} AND userId = ${userId};
        `;

        if (updatedPassword.rowCount === 0) {
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
