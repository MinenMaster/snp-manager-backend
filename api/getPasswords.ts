import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "./authenticateJWT";

export const getPasswords = async (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (!user) return;

    try {
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
                p.userId = ${user.id};
        `;

        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching passwords:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
