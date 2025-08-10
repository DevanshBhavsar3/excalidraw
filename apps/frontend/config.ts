export const HTTP_URL =
  process.env.NODE_ENV === "production"
    ? "https://excalidraw-http-q8az.onrender.com"
    : "http://localhost:3001";

export const WS_URL =
  process.env.NODE_ENV === "production"
    ? "https://excalidraw-ws-b3aw.onrender.com"
    : "ws://localhost:8080";
