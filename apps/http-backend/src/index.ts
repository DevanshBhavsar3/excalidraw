import express from "express";
import z from "zod";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { authMiddleware } from "./authMiddleware";

const app = express();
const PORT = process.env.PORT || 3001;

// TODO: Sign userId as JWT payload

app.post("/signup", (req, res) => {
  const requiredBody = z.object({
    username: z.string(),
    password: z.string(),
  });
  const parsedBody = requiredBody.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: "Invalid Username or Password." });
    return;
  }

  const body = parsedBody.data;

  //   create user
  const token = jwt.sign(body.username, JWT_SECRET);

  res.json({ token });
});

app.post("/signin", (req, res) => {
  const requiredBody = z.object({
    username: z.string(),
    password: z.string(),
  });
  const parsedBody = requiredBody.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: "Invalid Username or Password." });
    return;
  }

  const body = req.body;

  //   check for username and check password
  const token = jwt.sign(body.username, JWT_SECRET);

  res.json({ token });
});

app.post("/create", authMiddleware, (req, res) => {
  // db call
  res.json({ roomId: 123 });
});

app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
