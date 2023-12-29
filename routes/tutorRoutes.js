import express from "express";
import multer from "multer";
import path from "path";
import {
  tutorRegister,
  tutorLogin,
  Verification,
  tutorNotApprouved,
  tutorDetails,
  tutorSave,
  buyers,
  tutorCourseDetails
} from "../controller/tutorController.js";
import { fileURLToPath } from "url";
import {
  addCourse,
  courseDetails,
  singleCourseDetails,
} from "../controller/courseController.js";
import { TutorAuth } from "../middleware/Auth.js";

const tutorRoute = express.Router();
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
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../VideoFiles"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + file.originalname;
    cb(null, name);
  },
});
const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 1024 * 1024 * 1000,
  },
});

//image upload


const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../Files"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});



const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1024 * 1024 * 1024 * 100, // 20 MB
  }
});

tutorRoute.post("/register", upload.single("cv"), tutorRegister);
tutorRoute.post("/verifyTutor", Verification);
tutorRoute.post("/tutor-login", tutorLogin);
tutorRoute.get("/tutorList", tutorNotApprouved);
tutorRoute.get("/tutorDetails", TutorAuth, tutorDetails);
tutorRoute.post("/tutorSave", TutorAuth, imageUpload.single('image'), tutorSave);
tutorRoute.post(
  "/addCourse",
  videoUpload.fields([
    { name: "video" },
    { name: "trailorVideo" },
    { name: "image" },
  ]),
  TutorAuth, addCourse
);
tutorRoute.get("/getCourse", TutorAuth, tutorCourseDetails);
tutorRoute.get("/singleCourseDetails/:courseId", TutorAuth, singleCourseDetails);
tutorRoute.get("/myBuyersDetails/:courseId", TutorAuth, buyers)
export default tutorRoute;
