import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true }
}, { timestamps: true });

const Class = mongoose.model("Class", classSchema);
export default Class;
