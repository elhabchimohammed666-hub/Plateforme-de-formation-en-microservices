import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }],
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);
