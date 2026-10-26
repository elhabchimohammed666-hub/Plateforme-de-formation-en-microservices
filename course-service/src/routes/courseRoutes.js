import { Router } from "express";
import Course from "../models/Course.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const courses = await Course.find();
    return res.json(courses);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Formation introuvable." });
    }
    return res.json(course);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Formation introuvable." });
    }
    return next(error);
  }
});

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    return res.status(201).json(course);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "Données de formation invalides.", details: error.message });
    }
    return next(error);
  }
});

export default router;
