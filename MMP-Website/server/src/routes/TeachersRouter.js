// Import Modules
import express from "express";
import { validationResult } from "express-validator";
import {
    validateTeacherReqBody,
    cleanTeacherObject,
    validateStatusReqBody,
    cleanStatusUpdateObject,
} from "../validators/TeachersValidator.js";
import { validatePasswordBody, cleanPasswordObject } from "../validators/PasswordValidator.js";
import { db as prisma } from "../utils/db.server.js";
import { getLatestIDSegments, exclude, allowed, generatePasswordHash } from "../utils/helpers.js";
import { sendEmail } from "../utils/email_service.js";
import {
    adminFacultySignupEmail,
    facultyAcceptedSignupEmail,
    facultyRejectedSignupEmail,
} from "../utils/email_templates.js";

// Express Router
const TeachersRouter = express.Router();

/* Helper Functions */
//Check if ID Exists
const checkIDExists = async (teacher_id) => {
    const teacherEntry = await prisma.Teachers.findUnique({
        where: {
            teacher_id: teacher_id,
        },
    });

    if (teacherEntry == null) {
        return false;
    } else {
        return true;
    }
};

// Check if Email Exists
const checkEmailExists = async (email) => {
    const teacherEntry = await prisma.Teachers.findUnique({
        where: {
            email: email,
        },
    });

    if (teacherEntry == null) {
        return false;
    } else {
        return true;
    }
};

// Generate teacher_id
const generateTeacherID = async () => {
    // ID Format: YYYY-AAA-III
    // Year [0:4] - Account Type Code [5:8] ID Number [9:12]
    const currentYear = new Date().getFullYear().toString();

    // Get latest added teacher entry
    const teacherEntries = (
        await prisma.Teachers.findMany({
            select: {
                teacher_id: true,
            },
            where: {
                teacher_id: {
                    startsWith: currentYear,
                },
            },
            orderBy: {
                teacher_id: "desc",
            },
        })
    ).map((element) => {
        return element.teacher_id;
    });

    //If last teacher id is null
    if (teacherEntries.length === 0) {
        return currentYear + "-600-000";
    }

    //Get latest id segments
    const { second, third } = getLatestIDSegments(teacherEntries);

    if (parseInt(third) < 999) {
        return currentYear + "-" + second + "-" + (parseInt(third) + 1).toString().padStart(3, "0");
    }

    if (parseInt(second) < 899) {
        return currentYear + "-" + (parseInt(second) + 1).toString().padStart(3, "0") + "-000";
    }

    // It is possible for ID to overflow if there are more than 300 000 teachers in a year
    // Doubt that will happen, but if it does, we can just add another digit to the ID number
    throw new Error("ID Overflow!");
};

/* Controllers */

/* GET Endpoints */
// Get Teacher
TeachersRouter.get("/:teacher_id", async (req, res) => {
    if (!allowed(req.permission, [2, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get teacher_id from req.params
        const { teacher_id } = req.params;

        //Check if teacher exists
        if (!(await checkIDExists(teacher_id))) {
            throw new Error("Teacher does not exist");
        }

        // Get teacher from database
        const teacher = await prisma.Teachers.findUnique({
            where: {
                teacher_id: teacher_id,
            },
            select: {
                teacher_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                email: true,
                status: true,
                created_at: true,
            },
        });

        // Return teacher
        res.status(200).send(teacher);
    } catch (error) {
        //Return error
        res.status(404).send({ error: error.message });
    }
});

// Get All Teachers
TeachersRouter.get("/", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get all teachers from database
        const teachers = await prisma.Teachers.findMany({
            select: {
                teacher_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                email: true,
                status: true,
                created_at: true,
            },
            orderBy: {
                teacher_id: "asc",
            },
        });

        // Return teachers array entries
        res.status(200).send(teachers);
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

// Get All Teachers of certain status
TeachersRouter.get("/all/:status", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const { status } = req.params;

        // Get all teachers from database
        const teachers = await prisma.Teachers.findMany({
            where: {
                status: status.toUpperCase(),
            },
            select: {
                teacher_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                email: true,
                status: true,
                created_at: true,
            },
            orderBy: {
                teacher_id: "asc",
            },
        });

        // Return teachers array based on filter
        res.status(200).send(teachers);
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

/* POST Endpoints */
// Create Teacher
TeachersRouter.post("/", validateTeacherReqBody(), async (req, res) => {
    if (!allowed(req.permission, [0, 1, 2, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate Teacher Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        res.status(400).send({ errors: result.array() });
        return;
    }

    try {
        // Get teacher info from req.body
        const teacher = cleanTeacherObject(req.body);

        // Check if email already exists
        if (await checkEmailExists(teacher.email)) {
            throw new Error("Email already exists");
        }

        // Generate teacher_id
        teacher.teacher_id = await generateTeacherID();

        // Generate password hash
        teacher.password = generatePasswordHash(teacher.password);

        // Create teacher in database
        await prisma.Teachers.create({ data: teacher });

        // Send email to admin
        await sendEmail(
            adminFacultySignupEmail(
                `${teacher.first_name} ${teacher.middle_name} ${teacher.last_name}`,
                teacher.email,
                teacher.teacher_id
            )
        );

        res.status(200).send({ message: "Create successful" });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

/* PATCH Endpoints */
// Update Teacher
TeachersRouter.patch("/:teacher_id", validateTeacherReqBody(), async (req, res) => {
    if (!allowed(req.permission, [2, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate Teacher Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get teacher_id from req.params
        const { teacher_id } = req.params;

        //Check if teacher exists
        if (!(await checkIDExists(teacher_id))) {
            throw new Error("Teacher does not exist");
        }

        // Get updated info from req.body
        const updatedData = exclude(cleanTeacherObject(req.body), ["status", "password"]);

        // Update teacher in database
        await prisma.Teachers.update({
            where: {
                teacher_id: teacher_id,
            },
            data: updatedData,
        });

        res.status(200).send({ message: "Update successful" });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

// Update Teacher Status
TeachersRouter.patch("/status/:teacher_id", validateStatusReqBody(), async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate Teacher Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get teacher_id from req.params
        const { teacher_id } = req.params;

        // Check if teacher exists and get previous status
        const previousStatus = await prisma.Teachers.findUnique({
            where: {
                teacher_id: teacher_id,
            },
            select: {
                status: true,
            },
        });
        if (previousStatus == null) {
            throw new Error("Teacher does not exist");
        }

        // Get updated info from req.body
        const updatedData = cleanStatusUpdateObject(req.body);

        // Update teacher in database and store the result
        const updatedTeacher = await prisma.Teachers.update({
            where: {
                teacher_id: teacher_id,
            },
            data: updatedData,
            select: {
                first_name: true,
                middle_name: true,
                last_name: true,
                email: true,
                status: true,
            },
        });

        // Check if the previous status was "FOR_APPROVAL"
        if (previousStatus.status === "FOR_APPROVAL") {
            // Send acceptance/rejection email
            if (updatedData.status === "ACTIVE") {
                await sendEmail(
                    facultyAcceptedSignupEmail(
                        `${updatedTeacher.first_name} ${updatedTeacher.middle_name} ${updatedTeacher.last_name}`,
                        updatedTeacher.email,
                        teacher_id
                    )
                );
            } else if (updatedData.status === "REJECTED") {
                await sendEmail(facultyRejectedSignupEmail(updatedTeacher.email));
            }
        }

        res.status(200).send({ message: "Status updated" });
    } catch (error) {
        // Return error
        console.log(error);
        res.status(500).send({ error: error.message });
    }
});

// Update password
TeachersRouter.patch("/update_password/:teacher_id", validatePasswordBody(), async (req, res) => {
    if (!allowed(req.permission, [2])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate Teacher Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get teacher_id from req.params
        const { teacher_id } = req.params;

        // Check if admin exists
        if (!(await checkIDExists(teacher_id))) {
            throw new Error("Teacher does not exist");
        }

        if (teacher_id !== req.user.user_id) {
            res.status(403).send({ error: "You are not authorized to access this" });
            return;
        }

        // Get updated info from req.body
        const updatedData = cleanPasswordObject(req.body);

        // Update password in database
        await prisma.Teachers.update({
            where: {
                teacher_id: teacher_id,
            },
            data: updatedData,
        });

        res.status(200).send({ message: "Password successfully changed" });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

/* DELETE Endpoint */
// Delete Teacher
TeachersRouter.delete("/:teacher_id", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get teacher_id from req.params
        const { teacher_id } = req.params;

        //Check if teacher exists
        if (!(await checkIDExists(teacher_id))) {
            throw new Error("Teacher does not exist");
        }

        // Delete from database
        await prisma.Teachers.delete({
            where: {
                teacher_id: teacher_id,
            },
        });

        res.status(200).send({
            message: "Teacher " + teacher_id + " has been successfully deleted from the database",
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Export router
export default TeachersRouter;
