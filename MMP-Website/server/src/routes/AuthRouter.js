// Imports Modules
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db as prisma } from "../utils/db.server.js";
import { exclude } from "../utils/helpers.js";

// Express Router
const AuthRouter = express.Router();

/* Helper Functions */
/* Controllers */
// Login
AuthRouter.post("/login", async (req, res) => {
    try {
        // Get data from request body json
        const { user_id, password } = req.body;

        let user = null;
        let userPassword = null;
        let userType = null;

        // Determine user type and where to login
        const user_code = parseInt(user_id.split("-")[1]);
        if (user_code >= 0 && user_code <= 599) {
            user = await prisma.Students.findUnique({
                select: {
                    password: true,
                    status: true,
                },
                where: {
                    student_id: user_id,
                },
            });

            if (!user) {
                throw new Error("INVALID_CREDENTIALS");
            }

            if (user.status !== "ACTIVE") {
                throw new Error("INACTIVE_ACCOUNT");
            }

            userPassword = user.password;
            userType = "student";
        } else if (user_code >= 600 && user_code <= 899) {
            user = await prisma.Teachers.findUnique({
                select: {
                    password: true,
                    status: true,
                },
                where: {
                    teacher_id: user_id,
                },
            });

            if (!user) {
                throw new Error("INVALID_CREDENTIALS");
            }

            if (user.status !== "ACTIVE") {
                throw new Error("INACTIVE_ACCOUNT");
            }

            userPassword = user.password;
            userType = "teacher";
        } else if (user_code >= 900 && user_code <= 999) {
            userPassword = (
                await prisma.Admins.findUnique({
                    select: {
                        password: true,
                    },
                    where: {
                        admin_id: user_id,
                    },
                })
            )?.password;

            userType = "admin";
        } else {
            throw new Error("INVALID_CODE");
        }

        // Check if user exists, if not: respond with error
        if (!userPassword) {
            throw new Error("INVALID_CREDENTIALS");
        }

        // Password check
        if ((await bcrypt.compare(password, userPassword)) !== true) {
            throw new Error("INVALID_CREDENTIALS");
        }

        let user_info = null;

        //The reason why there are two queries is so that user data isn't retrieved for checking passwords
        switch (userType) {
            case "student":
                user_info = await prisma.Students.findUnique({
                    where: {
                        student_id: user_id,
                    },
                });
                break;
            case "teacher":
                user_info = await prisma.Teachers.findUnique({
                    where: {
                        teacher_id: user_id,
                    },
                });
                break;
            case "admin":
                user_info = await prisma.Admins.findUnique({
                    where: {
                        admin_id: user_id,
                    },
                });
                break;
            default:
                throw new Error("INVALID_TYPE");
        }

        // Create signed token with user id
        // Expires in 14 days if rememberMe is true, else 60 seconds
        // Include user_id and account_type in token
        let expiresIn = "14d";
        const token = jwt.sign(
            {
                account_type: userType,
                user_id: user_id,
                email: user_info.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: expiresIn }
        );

        // Remove password from user_info
        user_info = exclude(user_info, ["password"]);

        // Respond with token, account_type, user_id, and user
        return res.status(200).send({
            message: "Login Successful.",
            success: true,
            token: token,
            account_type: userType,
            user_id: user_id,
            user: user_info,
        });
    } catch (error) {
        switch (error) {
            case "INVALID_CREDENTIALS":
                res.status(401).send({
                    error: "Login Failed! Invalid credentials.",
                    displayable: true,
                });
                break;
            case "INACTIVE_ACCOUNT":
                res.status(403).send({
                    error: "Login Failed! This account is inactive.",
                    displayable: true,
                });
                break;
            case "INVALID_CODE":
                res.status(400).send({
                    error: "Login Failed! Unidentifiable ID code.",
                    displayable: true,
                });
                break;
            case "INVALID_TYPE":
                res.status(400).send({
                    error: "Login Failed! Unidentifiable user type.",
                    displayable: true,
                });
                break;
            default:
                res.status(500).send({ error: error.message, displayable: false });
        }
    }
});

// Export Router
export default AuthRouter;
