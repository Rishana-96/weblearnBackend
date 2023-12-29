import tutorModel from "../../backend/model/tutorModel.js";
import courseModel from "../model/courseModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bookingModel from "../model/bookingModel.js";
dotenv.config();

//---------tutor Register-----//
export const tutorRegister = async (req, res) => {
  try {
    const { name, qualification, email, password } = req.body;
    const cv = req.file.filename;
    const tutorExist = await tutorModel.findOne({ email: email });
    if (tutorExist) {
      return res.status(400).json({
        message: "tutor is already exist",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const tutor = new tutorModel({
      name,
      email,
      qualification,
      cv,
      password: hashPassword,
    });
    const result = await tutor.save();
    if (result) {
      sendMail(result.name, result.email, result._id);
      res.status(200).json(result);
    } else {
      res.status(400).send({
        message: "Can't registered,Something went wrong",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//----send mail verification--//

const sendMail = async (name, email, id) => {
  try {
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
      subject: "For verification mail",
      html: ` <html>
            <body>
                <h1>WEB LEARN Account for Tutor Verification</h1>
                <p>Hi ${name},</p>
                <p>Thank you for signing up with Web Learn. Please click the button below to verify your account:</p>
              
                    <img src="https://www.nicepng.com/png/detail/960-9602830_email-verification-email-verify-icon-png.png" alt="Verification Image" width="500" height="300"><br>
                    <div style="text-align: center;">
                    <a href="http://localhost:4200/tutor/tutor-login/${id}" style="text-decoration: none;">
                        <button style="background-color: #008CBA; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                            Verify Account
                        </button>
                    </a>
                </div>
        
                <p>If you have any questions or need assistance, please contact our support team.</p>
            </body>
        </html>
                `,
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

//---tutor verification-------//

export const Verification = async (req, res) => {
  try {
    const id = req.query.id;
    const tutordata = await tutorModel.findOne({ _id: id });
    if (tutordata) {
      await tutorModel.updateOne({ _id: id }, { is_verified: true });
      const token = jwt.sign(
        { _id: tutordata._id },
        process.env.TUTORSECRETKEY
      );
      res.json(token);
    } else {
      res.status(400).send({
        message: "something went wrong",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//-----tutor login---------//

export const tutorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    const tutorData = await tutorModel.findOne({ email: email });
    console.log(tutorData);

    if (!tutorData) {
      return res.status(404).send({
        message: "Tutor not found",
      });
    }
    if (tutorData.is_blocked) {
      return res.status(404).send({
        message: "This tutor is blocked by administrator",
      });
    }
    if (!(await bcrypt.compare(password, tutorData.password))) {
      return res.status(404).send({
        message: "Password is not correct",
      });
    }

    if (!tutorData.is_verified) {
      return res.status(404).send({
        message: "email not verified",
      });
    }

    if (tutorData.is_approve == "approved") {
      const token = jwt.sign({ _id: tutorData.id }, process.env.TUTORSECRETKEY);
      return res.json(token);
    } else if (tutorData.is_approve == "rejected") {
      return res.status(404).send({
        message: "you are rejected by admin",
      });
    } else {
      return res.status(403).send({
        message: "please wait for admin approuval",
      });
    }


  } catch (error) {
    console.log(error.message);
  }
};

//-----tutor login---------//

export const tutorNotApprouved = async (req, res) => {
  try {
    const tutorDAta = await tutorModel.find({ is_approve: "waiting" });
    if (tutorDAta) {
      res.status(200).json(tutorDAta);
    } else {
      res.status(400).json({
        message: "something went wrong",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//-----------------tutor-Details----------//
export const tutorDetails = async (req, res, next) => {
  try {

    const token = req.headers.authorization?.split(" ")[1];


    const claim = jwt.verify(token, process.env.TUTORSECRETKEY);

    const id = claim._id;
    const tutorDetail = await tutorModel.findById(id);

    if (tutorDetail) {
      return res.status(200).json(tutorDetail);
    } else {
      return res.status(400).json({ message: "something went wrong" });
    }
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//-------------Tutorsave------//
export const tutorSave = async (req, res, next) => {
  try {
    console.log('hj');
    const token = req.headers.authorization?.split(" ")[1];

    const claim = jwt.verify(token, process.env.TUTORSECRETKEY);

    const id = claim._id;
    let filename
    if (req.file) {
      filename = req.file.filename
    } else {
      filename = req.body.image
    }

    const updatedTutor = await tutorModel.findOneAndUpdate(
      {
        _id: id,
      },
      { $set: { name: req.body.name, qualification: req.body.qualification, image: filename } },
      { new: true }
    );


    if (updatedTutor) {
      res.status(200).json({
        message: 'Tutor data updated successfully',
        updatedTutor: updatedTutor
      }

      );
    } else {
      res.status(400).json({
        message: "some thing went wrong",
      });
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};
//--------------------tutor courses--------------------//
export const tutorCourseDetails = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const claim = jwt.verify(token, process.env.TUTORSECRETKEY);
    const tutorId = claim._id;
    if (tutorId) {
      const tutorCourses = await courseModel.find({ tutorId: tutorId }).populate("tutorId").sort({ courseEnrolledDate: -1 })
      if (tutorCourses) {
        return res.status(200).json(tutorCourses)
      } else {
        return res.status(400).json({ message: "tutor courses not found" })
      }
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};
//---------------buyers details--------------//
export const buyers = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const claim = jwt.verify(token, process.env.TUTORSECRETKEY);
    const tutorId = claim._id;
    const courseId = req.params.courseId;
    const buyers = await bookingModel.find({
      tutorId: tutorId,
      courseId: courseId,
      paymentStatus: 'success'
    }).populate("userId")

    if (buyers) {
      return res.status(200).json(buyers)
    } else {
      return res.status(400).json({ message: 'No buyers for this course' })
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal servor error' })
  }
}
