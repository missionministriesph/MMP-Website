// Imports Modules
import express from "express";
import { validationResult } from "express-validator";
import {
    validateStudentReqBody,
    cleanStudentObject,
    validateStatusReqBody,
    cleanStatusObject,
} from "../validators/StudentsValidator.js";
import { validatePasswordBody, cleanPasswordObject } from "../validators/PasswordValidator.js";
import { db as prisma } from "../utils/db.server.js";
import { getLatestIDSegments, exclude, allowed, generatePasswordHash } from "../utils/helpers.js";
import { sendEmail } from "../utils/email_service.js";
import {
    adminStudentEnrollmentEmail,
    studentAcceptedEnrollmentEmail,
    studentRejectedEnrollmentEmail,
} from "../utils/email_templates.js";

// Express Router
const StudentsRouter = express.Router();

/* Helper Functions */
//Parse to correct data types
const parser = (object) => {
    object["birthdate"] = new Date(object["birthdate"]);
    object["no_of_children"] = parseInt(object["no_of_children"]);
    object["is_partner_school"] = object["is_partner_school"] === "true";
    object["gradeschool_completed"] = object["gradeschool_completed"] === "true";
    object["highschool_completed"] = object["highschool_completed"] === "true";
    object["college_completed"] = object["college_completed"] === "true";
    object["graduate_completed"] = object["graduate_completed"] === "true";

    return object;
};

//Check if ID Exists
const checkIDExists = async (student_id) => {
    const studentEntry = await prisma.Students.findUnique({
        where: {
            student_id: student_id,
        },
    });

    if (studentEntry == null) {
        return false;
    } else {
        return true;
    }
};

// Check if Email Exists
const checkEmailExists = async (email) => {
    const studentEntry = await prisma.Students.findUnique({
        where: {
            email: email,
        },
    });

    if (studentEntry == null) {
        return false;
    } else {
        return true;
    }
};

// Generate student_id
const generateStudentID = async () => {
    // ID Format: YYYY-AAA-III
    // Year [0:4] - Account Type Code [5:8] ID Number [9:12]
    const currentYear = new Date().getFullYear().toString();

    // Get last created student_id
    const studentEntries = (
        await prisma.Students.findMany({
            select: {
                student_id: true,
            },
            where: {
                student_id: {
                    startsWith: currentYear,
                },
            },
            orderBy: {
                student_id: "desc",
            },
        })
    ).map((element) => {
        return element.student_id;
    });

    //If last student id is null
    if (studentEntries.length === 0) {
        return currentYear + "-000-000";
    }

    //Get latest id segments
    const { second, third } = getLatestIDSegments(studentEntries);

    if (parseInt(third) < 999) {
        return currentYear + "-" + second + "-" + (parseInt(third) + 1).toString().padStart(3, "0");
    }

    if (parseInt(second) < 599) {
        return currentYear + "-" + (parseInt(second) + 1).toString().padStart(3, "0") + "-000";
    }

    // It is possible for ID to overflow if there are more than 600 000 students in a year
    // Doubt that will happen, but if it does, we can just add another digit to the ID number
    throw new Error("ID Overflow!");
};

/* Controllers */

/* GET Endpoints */
// Get Student
StudentsRouter.get("/id/:student_id", async (req, res) => {
    if (!allowed(req.permission, [1, 2, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get student_id from req.params
        const { student_id } = req.params;

        // Check if student exists
        if (!(await checkIDExists(student_id))) {
            throw new Error("Student does not exist");
        }

        // Get student from database
        let student = null;
        if (req.permission === 3) {
            student = await prisma.Students.findUnique({
                where: {
                    student_id: student_id,
                },
                select: {
                    student_id: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    address: true,
                    mobile_number: true,
                    landline: true,
                    email: true,
                    birthdate: true,
                    birthplace: true,
                    nationality: true,
                    gender: true,
                    civil_status: true,
                    no_of_children: true,
                    school: true,
                    occupation: true,
                    admin: true,
                    church: true,
                    pastor: true,
                    is_partner_school: true,
                    gradeschool: true,
                    highschool: true,
                    college: true,
                    college_course: true,
                    graduate_course: true,
                    graduate: true,
                    others: true,
                    gradeschool_completed: true,
                    highschool_completed: true,
                    college_completed: true,
                    graduate_completed: true,
                    essay: true,
                    emergency_name: true,
                    emergency_address: true,
                    emergency_mobile_number: true,
                    status: true,
                    track: true,
                    created_at: true,
                },
            });
        } else {
            student = await prisma.Students.findUnique({
                where: {
                    student_id: student_id,
                },
                select: {
                    student_id: true,
                    first_name: true,
                    last_name: true,
                    middle_name: true,
                    email: true,
                },
            });
        }

        // Return student
        res.status(200).send(student);
    } catch (error) {
        // Return error
        res.status(404).send({ error: error.message });
    }
});

// Get all student records for a specific year
StudentsRouter.get("/year/:year", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get the school year from req.params
        const { year } = req.params;

        const records = await prisma.Students.findMany({
            where: {
                student_id: {
                    startsWith: year,
                },
            },
            select: {
                student_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                address: true,
                mobile_number: true,
                landline: true,
                email: true,
                birthdate: true,
                birthplace: true,
                nationality: true,
                gender: true,
                civil_status: true,
                no_of_children: true,
                school: true,
                occupation: true,
                admin: true,
                church: true,
                pastor: true,
                is_partner_school: true,
                gradeschool: true,
                highschool: true,
                college: true,
                college_course: true,
                graduate_course: true,
                graduate: true,
                others: true,
                gradeschool_completed: true,
                highschool_completed: true,
                college_completed: true,
                graduate_completed: true,
                essay: true,
                emergency_name: true,
                emergency_address: true,
                emergency_mobile_number: true,
                status: true,
                track: true,
            },
            orderBy: {
                student_id: "desc",
            },
        });

        // Return all values
        res.status(200).send(records);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

//Get all students for a particular class
StudentsRouter.get("/module/:module_name/:school_year", async (req, res) => {
    if (!allowed(req.permission, [2, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get module_name from req.params
        const { module_name } = req.params;

        //Convert school year to int
        const school_year = parseInt(req.params.school_year);

        //Get all students
        if (req.permission === 3) {
            const students = await prisma.Module_Enrollments.findMany({
                where: {
                    module_name: module_name,
                    school_year: school_year,
                },
                select: {
                    status: true,
                    grade: true,
                    student: {
                        select: {
                            student_id: true,
                            first_name: true,
                            last_name: true,
                            middle_name: true,
                            email: true,
                        },
                    },
                    module: {
                        select: {
                            module_name: true,
                            school_year: true,
                            session_1: true,
                            session_2: true,
                        },
                    },
                },
                orderBy: {
                    student: {
                        student_id: "asc",
                    },
                },
            });

            res.status(200).send(students);
        } else {
            const students = await prisma.Module_Enrollments.findMany({
                where: {
                    module_name: module_name,
                    school_year: school_year,
                    module: {
                        teacher_id: req.user.user_id,
                    },
                },
                select: {
                    status: true,
                    grade: true,
                    student: {
                        select: {
                            student_id: true,
                            first_name: true,
                            last_name: true,
                            middle_name: true,
                            email: true,
                        },
                    },
                    module: {
                        select: {
                            module_name: true,
                            school_year: true,
                            session_1: true,
                            session_2: true,
                        },
                    },
                },
                orderBy: {
                    student: {
                        student_id: "asc",
                    },
                },
            });

            if (students.length > 0) {
                res.status(200).send(students);
            } else {
                res.status(403).send({ error: "Unauthorized" });
            }
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all students
StudentsRouter.get("/", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get all students
        const students = await prisma.Students.findMany({
            select: {
                student_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                address: true,
                mobile_number: true,
                landline: true,
                email: true,
                birthdate: true,
                birthplace: true,
                nationality: true,
                gender: true,
                civil_status: true,
                no_of_children: true,
                school: true,
                occupation: true,
                admin: true,
                church: true,
                pastor: true,
                is_partner_school: true,
                gradeschool: true,
                highschool: true,
                college: true,
                college_course: true,
                graduate_course: true,
                graduate: true,
                others: true,
                gradeschool_completed: true,
                highschool_completed: true,
                college_completed: true,
                graduate_completed: true,
                essay: true,
                emergency_name: true,
                emergency_address: true,
                emergency_mobile_number: true,
                status: true,
                track: true,
                created_at: true,
            },
            orderBy: {
                student_id: "asc",
            },
        });

        res.status(200).send(students);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all students by status
StudentsRouter.get("/status/:status", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get status from req.params
        const { status } = req.params;

        const records = await prisma.Students.findMany({
            where: {
                status: status,
            },
            select: {
                student_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                address: true,
                mobile_number: true,
                landline: true,
                email: true,
                birthdate: true,
                birthplace: true,
                nationality: true,
                gender: true,
                civil_status: true,
                no_of_children: true,
                school: true,
                occupation: true,
                admin: true,
                church: true,
                pastor: true,
                is_partner_school: true,
                gradeschool: true,
                highschool: true,
                college: true,
                college_course: true,
                graduate_course: true,
                graduate: true,
                others: true,
                gradeschool_completed: true,
                highschool_completed: true,
                college_completed: true,
                graduate_completed: true,
                essay: true,
                emergency_name: true,
                emergency_address: true,
                emergency_mobile_number: true,
                status: true,
                track: true,
            },
            orderBy: {
                student_id: "desc",
            },
        });

        // Return all values
        res.status(200).send(records);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

//Get all students id and name only
StudentsRouter.get("/id_name", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get all students
        const students = await prisma.Students.findMany({
            select: {
                student_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
            },
            orderBy: {
                student_id: "desc",
            },
        });

        res.status(200).send(students);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get all student id and names with not fully paid bills
StudentsRouter.get("/unpaid_bills", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const students = await prisma.Students.findMany({
            where: {
                bills: {
                    some: {
                        status: {
                            not: "FULLY_PAID",
                        },
                    },
                },
            },
            select: {
                student_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
            },
            orderBy: {
                student_id: "desc",
            },
        });

        res.status(200).send(students);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all student id and name with in progress enrollments
StudentsRouter.get("/in_progress", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const students = await prisma.Students.findMany({
            where: {
                enrollments: {
                    some: {
                        status: "IN_PROGRESS",
                    },
                },
            },
            select: {
                student_id: true,
                first_name: true,
                last_name: true,
                middle_name: true,
                created_at: true,
            },
            orderBy: {
                student_id: "asc",
            },
        });

        res.status(200).send(students);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all students enrolled in a specific module
StudentsRouter.get("/module/:module_name", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const { module_name } = req.params;

        const unfiltered_students = await prisma.Module_Enrollments.findMany({
            where: {
                module_name: module_name,
            },
            select: {
                student: {
                    select: {
                        student_id: true,
                        first_name: true,
                        last_name: true,
                        middle_name: true,
                        created_at: true,
                    },
                },
            },
        });

        //Filter students
        let uniqueIDs = [];
        let students = [];

        unfiltered_students.forEach((element) => {
            if (!uniqueIDs.includes(element.student.student_id)) {
                students.push(element.student);
                uniqueIDs.push(element.student.student_id);
            }
        });

        res.status(200).send(students);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/* POST Endpoints */
// Create a new student
StudentsRouter.post("/", validateStudentReqBody(), async (req, res) => {
    if (!allowed(req.permission, [0, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate Student Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get student from req.body
        const student = cleanStudentObject(req.body);

        // Check if email exists
        if (await checkEmailExists(student.email)) {
            throw new Error("Email already exists");
        }

        // Generate student_id
        student.student_id = await generateStudentID();

        // Generate password hash
        student.password = generatePasswordHash(student.password);

        // Parse for correct data types
        parser(student);

        // Create student in database
        await prisma.Students.create({ data: student });

        // Send email to admin
        await sendEmail(
            adminStudentEnrollmentEmail(
                `${student.first_name} ${student.last_name}`,
                student.email,
                student.student_id
            )
        );

        res.status(200).send({ message: "Create successful" });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

/* PATCH Endpoints */
// Update Student
StudentsRouter.patch("/:student_id", validateStudentReqBody(), async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate Student Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get student_id from req.params
        const { student_id } = req.params;

        // Check if student exists
        if (!(await checkIDExists(student_id))) {
            throw new Error("Student does not exist");
        }

        // Get updated info from req.body
        const updatedData = exclude(parser(cleanStudentObject(req.body)), ["password"]);

        // Update student in database
        await prisma.Students.update({
            where: {
                student_id: student_id,
            },
            data: updatedData,
        });

        res.status(200).send({ message: "Update successful" });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

// Update Student Status
StudentsRouter.patch("/status/:student_id", validateStatusReqBody(), async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate Student Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get student_id from req.params
        const { student_id } = req.params;

        // Check if student exists and get previous status
        const previousStatus = await prisma.Students.findUnique({
            where: {
                student_id: student_id,
            },
            select: {
                status: true,
            },
        });
        if (previousStatus == null) {
            throw new Error("Student does not exist");
        }

        // Get updated info from req.body
        const updatedData = cleanStatusObject(req.body);

        // Update student in database and store the result
        const updatedStudent = await prisma.Students.update({
            where: {
                student_id: student_id,
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
                    studentAcceptedEnrollmentEmail(
                        `${updatedStudent.first_name} ${updatedStudent.last_name}`,
                        updatedStudent.email,
                        student_id
                    )
                );
            } else if (updatedData.status === "REJECTED") {
                await sendEmail(studentRejectedEnrollmentEmail(updatedStudent.email));
            }
        }

        res.status(200).send({ message: "Status updated" });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

// Update password
StudentsRouter.patch("/update_password/:student_id", validatePasswordBody(), async (req, res) => {
    if (!allowed(req.permission, [1])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate Student Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get student_id from req.params
        const { student_id } = req.params;

        // Check if student exists
        if (!(await checkIDExists(student_id))) {
            throw new Error("Student does not exist");
        }

        if (student_id !== req.user.user_id) {
            res.status(403).send({ error: "You are not authorized to access this" });
            return;
        }

        // Get updated info from req.body
        const updatedData = cleanPasswordObject(req.body);

        // Update password in database
        await prisma.Students.update({
            where: {
                student_id: student_id,
            },
            data: updatedData,
        });

        res.status(200).send({ message: "Password successfully changed" });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

/* DELETE Endpoints */
// Delete Student
StudentsRouter.delete("/:student_id", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get student_id from req.params
        const { student_id } = req.params;

        // Check if student exists
        if (!(await checkIDExists(student_id))) {
            throw new Error("Student does not exist");
        }

        // Delete from database
        await prisma.Payments.deleteMany({
            where: {
                payee: student_id,
            },
        });

        await prisma.Bills.deleteMany({
            where: {
                billed_to: student_id,
            },
        });

        await prisma.Module_Enrollments.deleteMany({
            where: {
                student_id: student_id,
            },
        });

        await prisma.TOR_Requests.deleteMany({
            where: {
                student_id: student_id,
            },
        });

        await prisma.Students.delete({
            where: {
                student_id: student_id,
            },
        });

        res.status(200).send({
            message: "Student " + student_id + " has been successfully deleted from the database",
        });
    } catch (error) {
        // Return error
        res.status(404).send({ error: error.message });
    }
});

// Export Router
export default StudentsRouter;
