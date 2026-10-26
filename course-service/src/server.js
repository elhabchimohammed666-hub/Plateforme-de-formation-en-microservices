import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const port = Number(process.env.PORT || 5001);
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/course_db";

try {
  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`Course service listening on port ${port}`);
  });
} catch (error) {
  console.error("Unable to start course-service:", error);
  process.exitCode = 1;
}
