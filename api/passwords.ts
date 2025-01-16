import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "./tools/authenticateJWT";
import { encrypt, decrypt } from "./tools/encryption";
import { getCurrentTimestampISO } from "./tools/timestamp";

export const createPassword = async (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (!user) return;

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

        await sql`
            INSERT INTO snp_passwords 
                (userId, title, username, password, url, notes, categoryId)
            VALUES 
                (${userId}, ${title}, ${username}, ${encryptedPassword}, ${url}, ${notes}, ${categoryId});
        `;

        return res
            .status(201)
            .json({ message: "Password created successfully" });
    } catch (err) {
        console.error("Error creating password:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

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
                c.id AS categoryId
            FROM 
                snp_passwords p
            LEFT JOIN 
                snp_categories c 
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

        // check if the password exists and is owned by the user
        const passwordResult = await sql`
            SELECT * FROM snp_passwords WHERE id = ${id} AND userId = ${userId};
        `;

        if (passwordResult.rows.length === 0) {
            return res.status(404).json({ message: "Password not found" });
        }

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

        // give back the updated password
        const { rows } = await sql`
            SELECT * FROM snp_passwords WHERE id = ${id} AND userId = ${userId};
        `;

        const decryptedRows = rows.map((row) => ({
            ...row,
            password: decrypt(row.password),
        }));

        res.status(200).json(decryptedRows);
    } catch (err) {
        console.error("Error updating password:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

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
