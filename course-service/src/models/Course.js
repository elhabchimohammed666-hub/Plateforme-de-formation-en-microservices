import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    hours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
