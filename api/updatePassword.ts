import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "./authenticateJWT";
import { encrypt } from "./encryption";
import { getCurrentTimestampISO } from "./timestamp";

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

        const encryptedPassword = password ? encrypt(password) : undefined;

        await sql`
            UPDATE snp_passwords
            SET 
                title = COALESCE(${title}, title),
                username = COALESCE(${username}, username),
                password = COALESCE(${encryptedPassword}, password),
                url = COALESCE(${url}, url),
                notes = COALESCE(${notes}, notes),
                categoryId = COALESCE(${categoryId}, categoryId),
                lastUpdatedAt = ${getCurrentTimestampISO()}
            WHERE 
                id = ${id} AND userId = ${userId};
        `;

        //TODO - remove on update stuff on the database

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error updating password:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
