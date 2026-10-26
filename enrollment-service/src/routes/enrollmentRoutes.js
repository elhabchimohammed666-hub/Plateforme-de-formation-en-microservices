import axios from "axios";
import { Router } from "express";
import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";

const router = Router();
const courseServiceUrl = (process.env.COURSE_SERVICE_URL || "http://localhost:5001").replace(/\/+$/, "");
const courseServiceTimeout = 5000;

router.post("/", async (req, res, next) => {
  const { userId, courses } = req.body ?? {};
  if (
    typeof userId !== "string" ||
    !userId.trim() ||
    !Array.isArray(courses) ||
    courses.length === 0 ||
    courses.some((id) => typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id))
  ) {
    return res.status(400).json({
      message: "userId doit être renseigné et courses doit contenir des identifiants MongoDB valides.",
    });
  }

  try {
    const courseResponses = await Promise.all(
      courses.map((id) =>
        axios.get(`${courseServiceUrl}/courses/${encodeURIComponent(id)}`, {
          timeout: courseServiceTimeout,
        })
      )
    );
    const total = courseResponses.reduce((sum, response) => sum + Number(response.data?.price), 0);
    if (!Number.isFinite(total)) {
      return res.status(502).json({ message: "Le service formations a renvoyé un prix invalide." });
    }

    const enrollment = await Enrollment.create({
      userId: userId.trim(),
      courses: courses.map((id) => new mongoose.Types.ObjectId(id)),
      total,
    });
    return res.status(201).json(enrollment);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return res.status(404).json({ message: "Une ou plusieurs formations sont introuvables." });
      }
      if (!error.response) {
        return res.status(503).json({
          message: "Le service formations est indisponible. Réessayez plus tard.",
        });
      }
      return res.status(502).json({ message: "Erreur de communication avec le service formations." });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "Données d'inscription invalides.", details: error.message });
    }
    return next(error);
  }
});

export default router;
