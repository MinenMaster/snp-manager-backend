import express, { Request, Response } from "express";
import { registerUser } from "./login/register";
import { loginUser } from "./login/login";
import { authenticateJWT } from "./tools/authenticateJWT";
import { getPasswords } from "./passwords/getPasswords";
import { createPassword } from "./passwords/createPassword";
import { updatePassword } from "./passwords/updatePassword";
import { deletePassword } from "./passwords/deletePassword";
import { getCategories } from "./categories/getCategories";

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

app.put("/passwords/:id", updatePassword);

app.delete("/passwords/:id", deletePassword);

app.get("/categories", getCategories);

app.post("/categories", (req: Request, res: Response) => {
    res.json({ message: "This is the categories endpoint." });

    // TODO: implement this endpoint
});

app.put("/categories/:id", (req: Request, res: Response) => {
    res.json({ message: "This is the categories endpoint." });

    // TODO: implement this endpoint
});

app.get("/settings", (req: Request, res: Response) => {
    res.json({ message: "This is the settings endpoint." });

    // TODO: implement this endpoint
});

app.put("/settings", (req: Request, res: Response) => {
    res.json({ message: "This is the settings endpoint." });

    // TODO: implement this endpoint
});
