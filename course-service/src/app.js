import express from "express";
import courseRoutes from "./routes/courseRoutes.js";

const app = express();

app.use(express.json());
app.use("/courses", courseRoutes);
app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable." });
});
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Corps JSON invalide." });
  }
  console.error(error);
  return res.status(500).json({ message: "Erreur interne du service formations." });
});

export default app;
