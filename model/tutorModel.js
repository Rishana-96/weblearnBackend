import mongoose from "mongoose";

export const tutorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },

    is_verified: {
        type: Boolean,
        default: false
    },
    cv: {
        type: String,
        required: true
    },
    is_approve: {
        type: String,
        default: 'waiting'
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    reason: {
        type: String,
    }
})
const tutorModel = mongoose.model("tutor", tutorSchema);
export default tutorModel;