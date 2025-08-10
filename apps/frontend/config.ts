export const HTTP_URL =
  process.env.NODE_ENV === "production"
    ? "https://drawifyapi.devanshbhavsar.tech"
    : "http://localhost:3001";

export const WS_URL =
  process.env.NODE_ENV === "production"
    ? "https://drawifyws.devanshbhavsar.tech"
    : "ws://localhost:8080";
