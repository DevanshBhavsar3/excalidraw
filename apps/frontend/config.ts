export const HTTP_URL =
  process.env.NODE_ENV === "production"
    ? "http://drawifyapi.devanshbhavsar.tech"
    : "http://localhost:3001";

export const WS_URL =
  process.env.NODE_ENV === "production"
    ? "http://drawifyws.devanshbhavsar.tech"
    : "ws://localhost:8080";
