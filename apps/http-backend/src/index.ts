import express from "express";

const app = express();
const PORT = 3001;

app.get("/healthcheck", (req, res) => {
  res.json({ msg: "All systems working." });
});

app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
