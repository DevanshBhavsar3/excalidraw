import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket, req) => {
  const url = req.url;

  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

  if (!payload.userId) {
    socket.close();
    return;
  }

  socket.on("message", (data) => {
    socket.send("Hi");
  });
});
