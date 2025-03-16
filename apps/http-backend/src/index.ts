import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateRoomSchema, UserSchema } from "@repo/common/types";
import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./authMiddleware";
import cors from "cors";
import { model } from "./ai";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  const parsedBody = UserSchema.safeParse(req.body);

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
    console.log(e);
    res.status(400).json({ error: "Something went wrong." });
  }
});

app.post("/login", async (req, res) => {
  const parsedBody = UserSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: "Invalid Username or Password." });
    return;
  }

  const body = parsedBody.data;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!user) {
      res.status(400).json({ error: "User doesn't exists." });
      return;
    }

    const isCorrectPassword = await bcrypt.compare(
      body.password,
      user.password
    );
    if (!isCorrectPassword) {
      res.status(400).json({ error: "Invalid Password." });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.json({ token });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Something went wrong." });
    return;
  }
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
    res.status(400).json({ error: "Room already exists." });
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

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;

  try {
    const room = await prisma.room.findUnique({
      where: {
        slug,
      },
    });

    if (!room) {
      res.status(400).json({ error: "Invalid slug." });
      return;
    }

    res.json(room);
  } catch (e) {
    res.status(500).json({ error: "Something went wrong." });
    return;
  }
});

app.get("/user/rooms", authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const room = await prisma.room.findMany({
      where: {
        adminId: userId,
      },
    });

    res.json(room);
  } catch (e) {
    res.status(500).json({ error: "Something went wrong." });
    return;
  }
});

app.post("/generate", authMiddleware, async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const result = await model.generateContent(prompt);
    const shapes = result.response.text();

    res.json(shapes);
  } catch (e) {
    res.status(500).json({ error: "Something went wrong." });
    return;
  }
});

app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
