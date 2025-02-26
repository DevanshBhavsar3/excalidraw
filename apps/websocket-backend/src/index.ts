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
    socket.send(JSON.stringify({ type: "ERROR", message: "Invalid token." }));
    socket.close();
    return;
  }

  socket.on("message", async (data) => {
    const parsedData = JSON.parse(data.toString());
    const users = rooms.get(parsedData.roomId) || [];

    try {
      switch (parsedData.type) {
        case "JOIN_ROOM":
          const room = await prisma.room.findUnique({
            where: {
              id: parsedData.roomId,
            },
          });

          if (!room) {
            socket.send(
              JSON.stringify({ type: "ERROR", message: "Invalid room Id." })
            );
            socket.close();
          }

          rooms.set(parsedData.roomId, [...users, { userId, ws: socket }]);
          break;
        case "LEAVE_ROOM":
          const newUsers = users.filter((user) => user.userId !== userId);

          rooms.set(parsedData.roomId, newUsers);
          socket.close();
          break;
        case "CHAT":
          const chatMessage = parsedData.message;

          const chat = await prisma.chat.create({
            data: {
              roomId: parsedData.roomId,
              userId,
              message: chatMessage,
            },
          });

          users.forEach((user) =>
            user.ws.send(JSON.stringify({ type: "CHAT", message: chat }))
          );
          break;
        case "UPDATE":
          const updatedShape = JSON.parse(parsedData.message);

          const updatedChat = await prisma.chat.update({
            where: {
              id: updatedShape.id,
              roomId: parsedData.roomId,
            },
            data: {
              message: JSON.stringify(updatedShape.shape),
            },
          });

          users.forEach((user) =>
            user.ws.send(
              JSON.stringify({ type: "UPDATE", message: updatedChat })
            )
          );
          break;
        case "DELETE":
          const deletedShape = JSON.parse(parsedData.message);
          const shapeToDelete = await prisma.chat.delete({
            where: {
              id: deletedShape.id,
              roomId: parsedData.roomId,
            },
          });

          users.forEach((user) =>
            user.ws.send(
              JSON.stringify({ type: "DELETE", message: shapeToDelete })
            )
          );
          break;
      }
    } catch (e) {
      console.log(e);
      socket.send(
        JSON.stringify({ type: "ERROR", message: "Something went wrong." })
      );
    }
  });
});
