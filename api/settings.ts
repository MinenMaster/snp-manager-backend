import { Request, Response } from "express";
import { sql } from "@vercel/postgres";
import { authenticateJWT } from "./tools/authenticateJWT";

export const getSettings = async (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (!user) return;

    try {
        const settingsResult = await sql`
            SELECT twofactorenabled, nextreminder 
            FROM snp_settings 
            WHERE userid = (SELECT id FROM snp_users WHERE username = ${user.username});
        `;

        if (settingsResult.rows.length === 0) {
            return res.status(404).json({ message: "Settings not found" });
        }

        res.status(200).json(settingsResult.rows[0]);
    } catch (err) {
        console.error("Error fetching settings:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (!user) return;

    const { twofactorenabled, nextreminder } = req.body;

    try {
        const userIdResult = await sql`
            SELECT id FROM snp_users WHERE username = ${user.username};
        `;
        const userId = userIdResult.rows[0].id;

        if (!userId) {
            return res.status(404).json({ message: "User not found" });
        }

        await sql`
            UPDATE snp_settings
            SET twofactorenabled = ${twofactorenabled}, nextreminder = ${nextreminder}
            WHERE userid = ${userId};
        `;

        res.status(200).json({ message: "Settings updated successfully" });
    } catch (err) {
        console.error("Error updating settings:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createSettings = async (username: string) => {
    try {
        const userIdResult = await sql`
            SELECT id FROM snp_users WHERE username = ${username};
        `;
        const userId = userIdResult.rows[0].id;

        if (!userId) {
            throw new Error("User not found");
        }

        await sql`
            INSERT INTO snp_settings (userid, twofactorenabled, nextreminder)
            VALUES (${userId}, false, NULL);
        `;
    } catch (err) {
        console.error("Error creating settings for new user:", err);
        throw err;
    }
};
