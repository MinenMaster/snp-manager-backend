import express, { Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import { sql } from "@vercel/postgres";

var cors = require("cors");
const app = express();

app.use(express.json());  
app.use(cors());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "BaseURL!" });
});

app.get("/api", (req: Request, res: Response) => {
    res.json({ message: "Hello from Express API with TypeScript!" });
});

app.listen(3000, () => console.log("Server ready on port 3000.")); //! This stuff is useless

app.get("/passwords", (req: Request, res: Response) => {
  res.send("Getting passwords...");
});

// app.listen(3000, () => {
//   console.log(`Example app listening on port ${3000}`)
// })