import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
import { createServer } from "http";
const http = createServer(app);
import userRoute from "./routes/userRoutes.js";
import adminRoute from "./routes/adminRoutes.js";
import tutorRoute from "./routes/tutorRoutes.js";
import * as path from "path";
import { fileURLToPath } from "url";
dotenv.config();
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200"],
  })
);
app.use(cookieParser());
// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "./VideoFiles")));

// app.use(express.urlencoded({ extended: true }));

app.use("/files", express.static("Files"));
app.use("/courses", express.static("VideoFiles"));
app.use("/", userRoute);
app.use("/admin", adminRoute);
app.use("/tutor", tutorRoute);

mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("database connected successfully");
  });

const server = http.listen(process.env.PORT, () => {
  console.log("Server started listening to port");
});
