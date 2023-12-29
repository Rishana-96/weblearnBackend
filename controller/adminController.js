import userModel from "../model/userModel.js";
import tutorModel from "../model/tutorModel.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import courseModel from "../model/courseModel.js";
import bookingModel from "../model/bookingModel.js";
dotenv.config();

//---------Admin Login-----------------//

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminData = await userModel.findOne({ email: email });
    if (!adminData) {
      res.status(400).json({
        message: "incorrect email",
      });
    }
    if (!(await bcrypt.compare(password, adminData.password))) {
      res.status(400).json({
        message: "password is incorrect",
      });
    }
    if (adminData.is_admin) {
      const token = Jwt.sign(
        { _id: adminData._id },
        process.env.ADMINSECRETKEY
      );
      res.json(token);
    } else {
      return res.status(400).json({
        message: "you are not admin",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//----------userlist fetching------//

export const userList = async (req, res) => {
  try {
    const userList = await userModel.find({ is_admin: false });

    res.status(200).json(userList);
  } catch (error) {
    console.log(error.message);
  }
};

//-----tutor list---------//

export const tutorNotApproved = async (req, res) => {
  try {
    const tutorData = await tutorModel.find();
    if (tutorData) {
      res.status(200).json(tutorData);
    } else {
      res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//-----------------course List------------------------//
export const courseList = async (req, res, next) => {
  try {


    const allCourses = await courseModel
      .find()
      .populate("tutorId")
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
//-----------Block user---//

export const blockUser = async (req, res) => {
  try {
    const { id } = req.body;
    const updateUser = await userModel.updateOne(
      { _id: id },
      { $set: { is_blocked: true } }
    );
    if (updateUser) {
      res.json(updateUser);
    } else {
      res.status(400).json({
        message: "user blocking failed",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//-------------Unblock user--------------------//
export const unblockUser = async (req, res) => {
  try {
    const { id } = req.body;
    const updateUser = await userModel.updateOne(
      { _id: id },
      { $set: { is_blocked: false } }
    );
    if (updateUser) {
      res.json(updateUser);
    } else {
      res.json(400).json({
        message: "user unblocking failed",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//----------tutor approval----------/
const statusItem = {
  appoved: "approved",
  isWaiting: "waiting",
  rejected: "rejected"
}

export const approveTutor = async (req, res) => {
  try {
    const { id, status } = req.body;

    const tutorData = await tutorModel.findById(id);
    if (!tutorData) {
      return res.status(404).json({ message: "Tutor not found" });
    }
    if (tutorData.is_approve !== statusItem.isWaiting) {
      return res
        .status(400)
        .json({ message: "Tutor application has been processed" });
    }

    //update tutors approval status
    tutorData.is_approve = status;
    await tutorData.save();
    if (status === statusItem.appoved) {
      const { name, email, tutorId } = tutorData
      sendMail(name, email, tutorId);
    }
    res.status(200).json({
      message: `Tutor application ${status === statusItem.appoved ? statusItem.appoved : statusItem.rejected
        }`,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal servor error" });
  }
};

//----------tutor reject----------/

export const rejectTutor = async (req, res) => {
  try {
    const { id, status } = req.body;
    const tutorData = await tutorModel.findById(id);
    if (!tutorData) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const name = tutorData.name;
    const email = tutorData.email;
    sendMail(name, email, status);
    //update tutors approval status
    tutorData.is_approve = statusItem.rejected;
    await tutorData.save();
    res.status(200).json({ message: "Tutor application rejected" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal servor error" });
  }
};

const sendMail = async (name, email, id, reason) => {
  try {
    let subject, message;
    if (reason) {
      //rejection email
      subject = "Tutor Application Rejection";
      message = `Hi ${name},\n\nWe regeret to inform you that your tutor application has been rejected due to the following :${reason}\n\nIf you have any questions,please contact our support team;`;
    } else {
      //approval email
      subject = "Tutor Application Approval";
      message = `Hi ${name},\n\nCongrtulations!Your tutor application has been approved .\n\nPlease click the following link to verify your account: <a href="http://localhost:4200/tutor/tutor-login">click here </a>\n\nIf you have any questions, please contact our support team.`;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTls: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.Pass,
      },
    });
    const mailOptions = {
      from: "WEB LEARN",
      to: email,
      subject: subject,
      html: message,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email send-->", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//-----------Block tutor---//

export const blockTutor = async (req, res) => {
  try {

    const { tutorId } = req.body;
    console.log(req.body);
    console.log(tutorId);
    const updateTutor = await tutorModel.findByIdAndUpdate(
      tutorId,
      { $set: { is_blocked: true } },
      { new: true }
    );
    console.log(updateTutor);
    if (updateTutor) {
      res.json(updateTutor);
    } else {
      res.status(400).json({
        message: "tutor blocking failed",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//-------------Unblock tutor--------------------//
export const unblockTutor = async (req, res) => {
  try {
    const { tutorId } = req.body;

    const updateTutor = await tutorModel.findByIdAndUpdate(
      tutorId,

      { $set: { is_blocked: false } },
      { new: true }
    );
    if (updateTutor) {
      res.json(updateTutor);
    } else {
      res.json(400).json({
        message: "tutor unblocking failed",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//------------block Course--------------------//
export const blockCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body
    console.log(req.body);
    const updateCourse = await courseModel.findByIdAndUpdate(
      courseId,
      { $set: { is_blocked: true } },
      { new: true }
    );
    if (updateCourse) {
      res.json(updateCourse)
    } else {
      return res.status(400).json({ message: "Course blocking failed" })
    }

  } catch (error) {
    console.log(error.message);
  }
}
//----------course unblocking-----------//
export const unblockCourse = async (req, res, next) => {
  try {

    const { courseId } = req.body
    console.log(courseId);
    const updateCourse = await courseModel.findByIdAndUpdate(
      courseId,
      { $set: { is_blocked: false } },
      { new: true }
    )
    if (updateCourse) {
      return res.status(200).json(updateCourse)
    } else {
      return res.status(400).json({
        message: "course unblocking failed"
      })
    }
  } catch (error) {
    console.log(error.message);
  }
}

//-----------------------dashboard----------------------------------//
export const getDashboard = async (req, res, next) => {
  try {
    const courseData = await courseModel.countDocuments()
    const userData = await userModel.countDocuments()
    const tutorData = await tutorModel.countDocuments()
    const buyers = await bookingModel.countDocuments({ paymentStatus: 'success' })

    const aggregatedData = await courseModel.aggregate([
      {
        $group: {
          _id: '$courseName',
          totalCourses: { $sum: 1 }
        }
      }
    ]);

    console.log(aggregatedData);

    const dashboardData = { courseData, userData, tutorData, buyers, aggregatedData }
    if (dashboardData) {
      return res.status(200).json(dashboardData)
    } else {
      return res.status(400).json({ message: 'Something went wrong' })
    }


  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal servor error" });
  }
}