import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { authMiddleware } from "./authMiddleware";
import { CreateUserSchema, SigninUserSchema } from "@repo/common/types";
import prisma from "@repo/db/client";

const app = express();
const PORT = process.env.PORT || 3001;

// TODO: Sign userId as JWT payload

app.post("/signup", async (req, res) => {
  const parsedBody = CreateUserSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: "Invalid Username or Password." });
    return;
  }

  const body = parsedBody.data;

  const user = await prisma.user.create({
    data: {
      username: body.username,
      password: body.password,
    },
  });

  const token = jwt.sign(user.id.toString(), JWT_SECRET);

  res.json({ token });
});

app.post("/signin", async (req, res) => {
  const parsedBody = SigninUserSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: "Invalid Username or Password." });
    return;
  }

  const body = parsedBody.data;

  const user = await prisma.user.findUnique({
    where: {
      username: body.username,
      password: body.password,
    },
  });

  if (!user) {
    res.json({ error: "Invalid credentials." });
    return;
  }

  const token = jwt.sign(user.id.toString(), JWT_SECRET);

  res.json({ token });
});

app.post("/create", authMiddleware, (req, res) => {
  // db call
  res.json({ roomId: 123 });
});

app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
