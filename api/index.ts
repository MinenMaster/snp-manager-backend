import express, { Request, Response } from "express";
import { registerUser } from "./register";
import { loginUser } from "./login";
import { authenticateJWT } from "./authenticateJWT";
import { getPasswords } from "./getPasswords";
import { createPassword } from "./createPassword";

var cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

app.listen(3000, () => console.log("Server ready on port 3000.")); //! The console.log() is pretty much useless

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "This is the SNP-Manager-API base url." });
});

app.post("/register", registerUser);

app.post("/login", loginUser);

app.get("/auth", (req: Request, res: Response) => {
    const user = authenticateJWT(req, res);
    if (user) {
        return res.status(200).json(user);
    }
});

app.get("/passwords", getPasswords);

app.post("/passwords", createPassword);

// app.get("/passwords/:id", (req: Request, res: Response) => {
//     if (!authenticateJWT(req, res)) return;
// });
