import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "../tools/authenticateJWT";
import { decrypt } from "../tools/encryption";

export const getPasswords = async (req: Request, res: Response) => {
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
            SELECT 
                p.id, 
                p.title, 
                p.username, 
                p.password, 
                p.url, 
                p.notes, 
                p.createdAt, 
                p.lastUpdatedAt, 
                c.name AS categoryName
            FROM 
                snp_passwords p
            LEFT JOIN 
                snp_category c 
            ON 
                p.categoryId = c.id
            WHERE 
                p.userId = ${userId};
        `;

        // if no passwords are found, return an empty array
        if (rows.length === 0) {
            return res.status(200).json([]);
        }

        const decryptedRows = rows.map((row) => ({
            ...row,
            password: decrypt(row.password),
        }));

        res.status(200).json(decryptedRows);
    } catch (err) {
        console.error("Error fetching passwords:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
