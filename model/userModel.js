import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    education: {
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
    is_verified: {
        type: Boolean,
        default: false
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
    },

    is_blocked: {
        type: Boolean,
        default: false
    },
})
const userModel = mongoose.model("user", userSchema);
export default userModel;