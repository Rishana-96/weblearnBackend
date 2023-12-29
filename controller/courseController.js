import tutorModel from "../../backend/model/tutorModel.js";
import courseModel from "../model/courseModel.js";
import userModel from "../model/userModel.js";
import jwt from "jsonwebtoken";
import dotenv, { populate } from "dotenv";
import bookingModel from "../model/bookingModel.js";
import reviewModel from "../model/reviewModel.js";
// import bookingModel from "../model/bookingModel.js";

dotenv.config();

export const addCourse = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.TUTORSECRETKEY);
    const id = claim._id;

    const courseData = await courseModel.findOne({
      courseName: req.body.courseName,
      tutorId: id,
    });
    if (courseData) {
      return res.status(400).json({
        message: "Course already exists",
      });
    }

    const {
      courseName,
      courseVideoDescription,
      courseVideoDuration,
      courseDescription,
      courseFee,
    } = req.body;

    const trailorVideo = req.files["trailorVideo"][0];
    const image = req.files["image"][0];
    const video = req.files["video"][0]; // Access the uploaded video file name
    const tutorId = id; // Use the tutor ID from the claim

    // Create newCourse
    const newCourse = new courseModel({
      courseName,
      courseTrailorVideo: trailorVideo.filename,
      courseVideo: video.filename,
      courseDescription,
      courseVideoDescription,
      courseVideoDuration,
      tutorId,
      courseFee,
      image: image.filename,
      courseEnrolledDate: new Date().toISOString(),
    });

    const savedCourse = await newCourse.save();
    res
      .status(201)
      .json({ message: "Course added successfully", course: savedCourse });
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};
//--------------Course Details-----------------//
export const courseDetails = async (req, res, next) => {
  try {


    const allCourses = await courseModel
      .find({ is_blocked: { $ne: true } })
      .populate("tutorId")
      .populate("review")
      .sort({ courseEnrolledDate: -1 })



    if (allCourses.length > 0) {
      return res.status(200).json(allCourses);
    } else {
      return res.status(400).json({ message: "No active courses found" })
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};
//--------------- single course details--------------------------//
export const singleCourseDetails = async (req, res, next) => {
  try {

    const courseId = req.params.courseId;
    console.log(courseId);
    const courseDetails = await courseModel
      .findById(courseId)
      .populate("tutorId")
      .populate({
        path: "review",
        populate: {
          path: 'userId',
          model: "user",
        }
      })
    // console.log(courseDetails);
    if (courseDetails) {
      return res.status(200).json(courseDetails);
    } else {
      return res.status(400).json({ message: "something went wrong" });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};
//----------------course save-----------//
export const saveCourse = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY);
    const userId = claim._id;
    const courseId = req.body.course
    const tutorData = await courseModel.findOne({
      _id: courseId,
    });

    const tutorId = tutorData.tutorId;

    const existingPurchase = await courseModel.findOne({
      _id: courseId,

      coursePurchasers: { $in: [userId] }
    });

    if (existingPurchase) {
      return res.status(400).json({ message: 'Course already purchased' })
    } else {

      const newBooking = new bookingModel({
        courseId: courseId,
        userId: userId,
        tutorId: tutorId,
        paymentStatus: 'pending'
      })



      await newBooking.save();


      if (newBooking) {
        return res.status(200).json(newBooking)
      } else {
        return res.status(400).json({ message: 'something went wrong' })
      }

    }




  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ error: 'Internal server error' })
  }
}
//-----------Verify payment----------------//
export const verifyPayment = async (req, res, next) => {
  try {


    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY);
    const _id = claim._id;

    const { courseId, bookingId } = req.body




    if (bookingId) {

      await Promise.all([
        courseModel.updateOne(
          { _id: courseId },
          {
            $push: { coursePurchasers: _id },

          },
          { new: true }
        )

      ]);

      const updateBooking = await bookingModel.updateOne(
        { _id: bookingId },
        { $set: { paymentStatus: 'success' } }
      );

      return res.status(200).json({ message: 'success' })
    }
  } catch (error) {

    return res.status(500).json({ error: 'Internal server error' })
  }
}
//---------------My Orders-----------------------//
export const myOrders = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const claim = jwt.verify(token, process.env.USERSECRETKEY)
    const userId = claim._id;
    const booking = await bookingModel.find({
      userId: userId,
      paymentStatus: 'success'
    }).populate("courseId").populate("tutorId");

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    return res.status(200).json(booking)

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }

}
//--------------- single video details--------------------------//
export const singleVideoDetails = async (req, res, next) => {
  try {

    const orderId = req.params.orderId;

    const orderDetails = await courseModel
      .findById(orderId)
      .populate("tutorId")
      .populate({
        path: "review",
        populate: {
          path: "userId",
          model: "user",
        },
      });


    if (orderDetails) {
      return res.status(200).json(orderDetails);
    } else {
      return res.status(400).json({ message: "something went wrong" });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    const claim = jwt.verify(token, process.env.USERSECRETKEY);

    const id = claim._id;
    const { comments, rating } = req.body;
    const courseId = req.params.courseId

    const review = new reviewModel({
      comments,
      rating,
      userId: id,
      courseId
    });

    const savedReview = await review.save();
    console.log(courseId);
    if (savedReview) {
      await courseModel.updateOne(
        { _id: courseId },
        { $push: { review: savedReview._id } },
        { new: true }
      )
      return res.status(200).json(savedReview);
    }



  } catch (error) {
    next(error)
    res.status(500).json({ message: "Internal server error" });
  }
}