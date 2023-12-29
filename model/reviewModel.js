import mongoose from "mongoose";

export const reviewSchema = new mongoose.Schema({

    comments: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        requred: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        requred: true
    }
});

const reviewModel = mongoose.model("review", reviewSchema);
export default reviewModel