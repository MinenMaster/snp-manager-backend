import express, { Request, Response } from "express";
import { registerUser } from "./register";
import { loginUser } from "./login";
import { authenticateJWT } from "./tools/authenticateJWT";
import {
    createPassword,
    getPasswords,
    updatePassword,
    deletePassword,
} from "./passwords";
import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
} from "./categories";
import { getSettings, updateSettings, createSettings } from "./settings";

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

app.post("/categories", createCategory);

app.put("/categories/:id", updateCategory);

app.delete("/categories/:id", deleteCategory);

app.get("/settings", getSettings);

app.put("/settings", updateSettings);
