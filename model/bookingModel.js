import mongoose from "mongoose";

export const bookingSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,

    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tutor",
        required: true,

    },
    paymentStatus: {
        type: String,
        default: 'pending'
    }
});
const bookingModel = mongoose.model("booking", bookingSchema);
export default bookingModel