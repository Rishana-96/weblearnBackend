import express from "express";
const userRoute = express();
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";


import {
  Verification,
  userRegister,
  userLogin,
  userDetails,
  userSave,


} from "../controller/userController.js";
import { userAuth } from "../middleware/Auth.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../Files"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});



const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 * 100, // 20 MB
  }
});
import {
  verifyPayment,
  courseDetails,
  saveCourse,
  singleCourseDetails,
  myOrders,
  singleVideoDetails,
  addReview
} from "../controller/courseController.js"

userRoute.post("/register", userRegister);
userRoute.post("/verifyUser", Verification);
userRoute.post("/login", userLogin);
userRoute.get("/userDetails", userAuth, userDetails);
userRoute.post("/userSave", upload.single('image'), userAuth, userSave);
userRoute.get("/getCourse", courseDetails);
userRoute.get("/singleCourseDetails/:courseId", userAuth, singleCourseDetails);
userRoute.post("/saveCourse", userAuth, saveCourse);
userRoute.post("/verifyPayment", userAuth, verifyPayment);
userRoute.get("/myOrders", userAuth, myOrders);
userRoute.get("/singleVideoDetails/:orderId", userAuth, singleVideoDetails);
userRoute.post("/addReview/:courseId", userAuth, addReview)
export default userRoute;
