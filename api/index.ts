import express, { Request, Response } from "express";
import { registerUser } from "./register";
import { loginUser } from "./login";
import { authenticateJWT } from "./authenticateJWT";
import { getPasswords } from "./getPasswords";

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
    if (authenticateJWT(req, res)) {
        return res.status(200).json({ message: "Authenticated" });
    }
});

app.get("/passwords", getPasswords);
