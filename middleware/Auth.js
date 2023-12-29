import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";
import tutorModel from "../model/tutorModel.js";

import dotenv from "dotenv";

dotenv.config();
export const userAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      const decode = jwt.verify(token, process.env.USERSECRETKEY);
      const user = await userModel.findOne({ _id: decode._id });
      if (user.is_blocked) {
        return res.status(403).json({
          message: "user blocked by admin",
        });
      } else if (user) {
        next();
      } else {
        return res.status(400).json({
          message: "user not authorised invalid user",
        });
      }
    } else {
      return res.status(400).json({
        message: "user not authorized",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.ADMINSECRETKEY);
      const admin = await userModel.findOne({ _id: decoded._id });

      if (admin) {
        next();
      } else {
        return res.status(400).json({
          message: "admin not authorised invalid admin",
        });
      }
    } else {
      return res.status(400).json({
        message: "admin not authorised",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const TutorAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.TUTORSECRETKEY);
      const tutor = await tutorModel.findOne({ _id: decoded._id });
      if (tutor.is_blocked) {
        return res.status(403).json({
          message: "You are blocked !!! try again later",
        });
      } else if (tutor) {
        next();
      } else {
        return res.status(400).json({
          message: "tutor not authorised invalid tutor",
        });
      }
    } else {
      return res.status(400).json({
        message: "tutor not authorised",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
