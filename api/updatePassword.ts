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

        // Dynamische SQL-Konstruktion
        const updates: string[] = [];
        const values: any[] = [];

        if (title !== undefined) {
            updates.push(`title = $${updates.length + 1}`);
            values.push(title);
        }
        if (username !== undefined) {
            updates.push(`username = $${updates.length + 1}`);
            values.push(username);
        }
        if (password !== undefined) {
            updates.push(`password = $${updates.length + 1}`);
            values.push(encrypt(password));
        }
        if (url !== undefined) {
            updates.push(`url = $${updates.length + 1}`);
            values.push(url);
        }
        if (notes !== undefined) {
            updates.push(`notes = $${updates.length + 1}`);
            values.push(notes);
        }
        if (categoryId !== undefined) {
            updates.push(`"categoryId" = $${updates.length + 1}`);
            values.push(categoryId);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        // SQL-Update ausführen
        const query = `
            UPDATE snp_passwords
            SET ${updates.join(", ")}
            WHERE id = $${updates.length + 1} AND userId = $${
            updates.length + 2
        };
        `;
        values.push(id, userId);

        const updatedPassword = await sql.raw(query, values);

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
