import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "./authenticateJWT";
import { encrypt } from "./encryption";

export const updatePassword = async (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (!user) return;

    const { id } = req.params;
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

        const updatedPassword = await sql`
            UPDATE snp_passwords 
            SET 
                title = ${title}, 
                username = ${username}, 
                password = ${encryptedPassword}, 
                url = ${url}, 
                notes = ${notes}, 
                categoryId = ${categoryId}
            WHERE 
                id = ${id} AND userId = ${userId};
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
