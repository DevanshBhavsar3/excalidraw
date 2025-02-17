import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: string;
  ws: WebSocket;
}
const rooms = new Map<number, User[]>();

function checkUser(token: string): null | string {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    return null;
  }
}

wss.on("connection", (socket, req) => {
  const url = req.url;

  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = checkUser(token);

  if (!userId) {
    socket.send("Invalid token.");
    socket.close();
    return;
  }

  socket.on("message", async (data) => {
    const parsedData = JSON.parse(data.toString());

    switch (parsedData.type) {
      case "JOIN_ROOM":
        try {
          const room = await prisma.room.findUnique({
            where: {
              id: parsedData.roomId,
            },
          });

          if (!room) {
            socket.send("Invalid room id.");
            socket.close();
          }

          rooms.set(parsedData.roomId, [
            ...(rooms.get(parsedData.roomId) || []),
            { userId, ws: socket },
          ]);
        } catch (e) {
          socket.send("Soemthing went wrong.");
          socket.close();
        }
        break;
      case "LEAVE_ROOM":
        const existingUsers = rooms.get(parsedData.roomId) || [];

        const newUsers = existingUsers.filter((user) => user.userId !== userId);

        rooms.set(parsedData.roomId, newUsers);
        break;
      case "CHAT":
        const users = rooms.get(parsedData.roomId);
        const message = parsedData.message;

        await prisma.chat.create({
          data: {
            roomId: parsedData.roomId,
            userId,
            message,
          },
        });

        if (!users) return;

        users.forEach((user) =>
          user.ws.send(JSON.stringify({ type: "CHAT", message }))
        );
        break;
    }
  });
});
