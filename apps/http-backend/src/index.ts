import { JWT_SECRET } from "@repo/backend-common/config";
import {
  CreateRoomSchema,
  CreateUserSchema,
  SigninUserSchema,
} from "@repo/common/types";
import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./authMiddleware";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  const parsedBody = CreateUserSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: "Invalid Username or Password." });
    return;
  }

  const body = parsedBody.data;

  try {
    const hashedPassword = await bcrypt.hash(body.password, 7);
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
      },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({ token });
  } catch (e) {
    res.status(400).json({ error: "Username already exists." });
  }
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
    },
  });

  if (!user) {
    res.status(400).json({ error: "User doesn't exists." });
    return;
  }

  const isCorrectPassword = await bcrypt.compare(body.password, user.password);
  if (!isCorrectPassword) {
    res.status(400).json({ error: "Invalid Password." });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  res.json({ token });
});

app.post("/create", authMiddleware, async (req, res) => {
  const parsedBody = CreateRoomSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: "Invalid data." });
    return;
  }

  const adminId = req.userId;

  try {
    const room = await prisma.room.create({
      data: {
        adminId,
        slug: parsedBody.data.name,
      },
    });
    res.json({ roomId: room.id });
  } catch (e) {
    res.json({ error: "Room already exists." });
  }
});

app.get("/chats/:roomId", authMiddleware, async (req, res) => {
  const roomId = parseInt(req.params.roomId as string);

  try {
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      res.status(400).json({ error: "Invalid room id." });
      return;
    }

    const chats = await prisma.chat.findMany({
      where: {
        roomId: room.id,
      },
      take: 50,
    });

    res.json({ chats });
  } catch (e) {
    res.status(400).json({ error: "Something went wrong." });
  }
});

app.get("/room/:slug", authMiddleware, async (req, res) => {
  const slug = req.params.slug;

  const room = await prisma.room.findFirst({
    where: {
      slug,
    },
  });

  if (!room) {
    res.status(400).json({ error: "Invalid slug." });
    return;
  }

  res.json(room);
});

app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
