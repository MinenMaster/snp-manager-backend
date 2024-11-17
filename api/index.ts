import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sql } from "@vercel/postgres";
import moment from "moment-timezone";
import { registerUser } from "./register";
import { loginUser } from "./login";

var cors = require("cors");
const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cors());

app.listen(3000, () => console.log("Server ready on port 3000.")); //! This stuff is useless, I think

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "This is the SNP-Manager-API base url." });
});

app.post("/register", registerUser);

app.post("/login", loginUser);
