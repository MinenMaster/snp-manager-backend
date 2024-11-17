import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sql } from "@vercel/postgres";
import moment from "moment-timezone";

var cors = require("cors");
const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cors());

app.listen(3000, () => console.log("Server ready on port 3000.")); //! This stuff is useless, I think

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "This is the SNP-Manager-API base url." });
});

app.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Username and password are required" });
    }

    const { rows } =
        await sql`SELECT * FROM snp_users WHERE username = ${username};`;

    if (rows.length > 0) {
        const user = rows[0];
        const isValidPassword = await bcrypt.compare(
            password,
            user.hashed_password
        );

        if (isValidPassword) {
            const token = jwt.sign({ username: user.username }, JWT_SECRET, {
                expiresIn: "1h",
            });

            await logLogin(user.username);

            res.json({ token });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

const logLogin = async (username: string) => {
    const timeZone = "Europe/Zurich";

    const timestampISO = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");

    const timestampFormatted = moment()
        .tz(timeZone)
        .format("DD.MM.YYYY HH:mm:ss (Z)");

    console.log(`[${timestampFormatted}] User ${username} logged in.`);

    try {
        await sql`INSERT INTO snp_login_logs (username, timestamp) VALUES (${username}, ${timestampISO});`;
    } catch (err) {
        console.error("Error logging login to database:", err);
    }
};

app.post("/register", async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Username and password are required" });
    }

    try {
        const existingUser =
            await sql`SELECT * FROM users WHERE username = ${username}`;
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await sql`INSERT INTO users (username, hashed_password) VALUES (${username}, ${hashedPassword})`;

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
