import express, { Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import { sql } from "@vercel/postgres";

var cors = require("cors");
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})