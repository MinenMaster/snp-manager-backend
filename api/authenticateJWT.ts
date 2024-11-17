import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateJWT = (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const user = jwt.verify(token, JWT_SECRET);
            if (user) {
                return true;
            }
        } catch (error) {
            return res.status(403).json({ error: "Forbidden" });
        }
    } else {
        return res.status(401).json({ error: "Unauthorized" });
    }
};
