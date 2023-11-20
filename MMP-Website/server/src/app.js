// Import Modules
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";

// Import Routes
import AuthRouter from "./routes/AuthRouter.js";
import StudentsRouter from "./routes/StudentsRouter.js";
import TeachersRouter from "./routes/TeachersRouter.js";
import AdminsRouter from "./routes/AdminsRouter.js";
import ModulesRouter from "./routes/ModulesRouter.js";
import BillsRouter from "./routes/BillsRouter.js";
import PaymentsRouter from "./routes/PaymentsRouter.js";
import ModuleEnrollmentsRouter from "./routes/ModuleEnrollmentsRouter.js";
import TORRequestsRouter from "./routes/TORRequestsRouter.js";
import ModuleDetailsRouter from "./routes/ModuleDetailsRouter.js";
import DownloadRouter from "./routes/DownloadRouter.js";

// Import Middleware
import { verifyToken } from "./middleware/tokenVerifier.js";

// Dotenv Variables
dotenv.config();
const PORT = process.env.PORT || 8081;

// Express App
const app = express();

// Express App Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(morgan("common"));
app.use(cors()); // TODO: Remove this in production
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Login Route
app.use("/API/auth", AuthRouter);

// Express App Routes
app.use("/API/students", verifyToken, StudentsRouter);
app.use("/API/teachers", verifyToken, TeachersRouter);
app.use("/API/bills", verifyToken, BillsRouter);
app.use("/API/payments", verifyToken, PaymentsRouter);
app.use("/API/admins", verifyToken, AdminsRouter);
app.use("/API/modules", verifyToken, ModulesRouter);
app.use("/API/module_enrollments", verifyToken, ModuleEnrollmentsRouter);
app.use("/API/tor_requests", verifyToken, TORRequestsRouter);
app.use("/API/module_details", verifyToken, ModuleDetailsRouter);
app.use("/API/download", verifyToken, DownloadRouter);

// Express App Server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
