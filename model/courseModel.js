import mongoose from "mongoose";

export const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },
  courseTrailorVideo: {
    type: String,
    required: true,
  },
  courseVideo: {
    type: String,
    required: true,
  },
  courseVideoDescription: {
    type: String,
    required: true,
    unique: true,
  },
  courseDescription: {
    type: String,
    required: true,
  },
  courseVideoDuration: {
    type: String,
    required: true,
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tutor",
    required: true,
  },
  courseFee: {
    type: String,
    required: true,
  },
  courseEnrolledDate: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  is_blocked: {
    type: Boolean,
    default: false
  },
  coursePurchasers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookings",
    },
  ],
  review: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "review"
    }
  ]


});
const courseModel = mongoose.model("course", courseSchema);
export default courseModel;
