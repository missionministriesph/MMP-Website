// Imports Modules
import express from "express";
import { validationResult } from "express-validator";
import {
    validateEnrollmentReqBody,
    cleanEnrollmentObject,
    validateEditGradeReqBody,
    cleanEditGradeObject,
} from "../validators/ModuleEnrollmentsValidator.js";
import { db as prisma } from "../utils/db.server.js";
import { allowed, exclude } from "../utils/helpers.js";
import { sendEmail } from "../utils/email_service.js";
import { adminStudentModuleEnrollmentEmail } from "../utils/email_templates.js";

// Express Router
const ModuleEnrollmentsRouter = express.Router();

/* Helper Functions */
//Check for existence
const exists = async (student_id, module_name, school_year) => {
    const enrollmentEntry = await prisma.Module_Enrollments.findUnique({
        where: {
            student_id_module_name_school_year: { student_id, module_name, school_year },
        },
    });

    if (enrollmentEntry == null) {
        return false;
    } else {
        return true;
    }
};

//Parse to correct data types
const parser = (object) => {
    if (object["school_year"]) {
        object["school_year"] = parseInt(object["school_year"]);
    }
    if (object["no_of_absences"]) {
        object["no_of_absences"] = parseInt(object["no_of_absences"]);
    }
    if (object["date_submitted"]) {
        object["date_submitted"] = new Date(object["date_submitted"]);
    }

    if (object["date_received"]) {
        object["date_received"] = new Date(object["date_received"]);
    }

    return object;
};

/* Controller */

/* GET Endpoints */
// Get an enrollment
ModuleEnrollmentsRouter.get(
    "/enrollment/:student_id/:module_name/:school_year",
    async (req, res) => {
        if (!allowed(req.permission, [1, 2, 3])) {
            res.status(403).send({ error: "You are not authorized to access this" });
            return;
        }

        try {
            //Get student_id and module_name from req.params
            const { student_id, module_name } = req.params;

            //Convert school year to int
            const school_year = parseInt(req.params.school_year);

            // Check if enrollment exists
            if (!(await exists(student_id, module_name, school_year))) {
                throw new Error("Enrollment does not exist");
            }

            //Set returned fields based on who is requesting
            let enrollment = null;
            switch (req.permission) {
                case 1:
                    enrollment = await prisma.Module_Enrollments.findUnique({
                        select: {
                            module_name: true,
                            school_year: true,
                            date_submitted: true,
                            date_received: true,
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
                            no_of_absences: true,
                            remarks: true,
                        },
                        where: {
                            student_id_module_name_school_year: {
                                student_id,
                                module_name,
                                school_year,
                            },
                        },
                    });

                    if (enrollment.student.student_id === req.user.user_id) {
                        res.status(200).send(enrollment);
                    } else {
                        res.status(403).send({ error: "Unauthorized" });
                    }
                    break;
                case 2:
                    enrollment = await prisma.Module_Enrollments.findUnique({
                        select: {
                            student_id: true,
                            module_name: true,
                            school_year: true,
                            status: true,
                            grade: true,
                            student: {
                                select: {
                                    first_name: true,
                                    last_name: true,
                                    middle_name: true,
                                    email: true,
                                },
                            },
                            module: {
                                select: {
                                    teacher_id: true,
                                },
                            },
                            no_of_absences: true,
                            remarks: true,
                        },
                        where: {
                            student_id_module_name_school_year: {
                                student_id,
                                module_name,
                                school_year,
                            },
                        },
                    });

                    if (enrollment.modules.teacher_id === req.user.user_id) {
                        delete enrollment.modules;
                        res.status(200).send(enrollment);
                    } else {
                        res.status(403).send({ error: "Unauthorized" });
                    }
                    break;
                case 3:
                    enrollment = await prisma.Module_Enrollments.findUnique({
                        select: {
                            module_name: true,
                            school_year: true,
                            status: true,
                            bill_no: true,
                            grade: true,
                            date_submitted: true,
                            date_received: true,
                            student: {
                                select: {
                                    student_id: true,
                                    first_name: true,
                                    last_name: true,
                                    middle_name: true,
                                    email: true,
                                },
                            },
                            no_of_absences: true,
                            remarks: true,
                        },
                        where: {
                            student_id_module_name_school_year: {
                                student_id,
                                module_name,
                                school_year,
                            },
                        },
                    });
                    res.status(200).send(enrollment);
                    break;
                default:
                    throw new Error("Something went wrong with your request");
            }
        } catch (error) {
            console.log(error.message);
            res.status(404).send({ error: error.message });
        }
    }
);

//Get all enrollments of a student
ModuleEnrollmentsRouter.get("/student/:student_id", async (req, res) => {
    if (!allowed(req.permission, [1, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get student_id from req.params
        const { student_id } = req.params;

        //Get all enrollments
        let enrollments = null;

        if (req.permission === 1) {
            if (student_id === req.user.user_id) {
                enrollments = await prisma.Module_Enrollments.findMany({
                    where: {
                        student_id: student_id,
                    },
                    select: {
                        school_year: true,
                        status: true,
                        grade: true,
                        no_of_absences: true,
                        remarks: true,
                        module: {
                            select: {
                                session_1: true,
                                session_2: true,
                                teacher: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                    },
                                },
                                details: {
                                    select: {
                                        module_name: true,
                                        program: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        module: {
                            module_name: "asc",
                        },
                    },
                });

                res.status(200).send(enrollments);
            } else {
                res.status(403).send({ error: "Unauthorized" });
            }
        } else {
            enrollments = await prisma.Module_Enrollments.findMany({
                where: {
                    student_id: student_id,
                },
                select: {
                    school_year: true,
                    status: true,
                    grade: true,
                    no_of_absences: true,
                    module: {
                        select: {
                            session_1: true,
                            session_2: true,
                            teacher: {
                                select: {
                                    first_name: true,
                                    last_name: true,
                                },
                            },
                            details: {
                                select: {
                                    module_name: true,
                                    program: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    module: {
                        module_name: "asc",
                    },
                },
            });

            res.status(200).send(enrollments);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all active enrollments of a student
ModuleEnrollmentsRouter.get("/active/:student_id", async (req, res) => {
    if (!allowed(req.permission, [1, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get student_id from req.params
        const { student_id } = req.params;

        //Validation check
        if (student_id !== req.user.user_id) {
            res.status(403).send({ error: "You are not authorized to access this" });
            return;
        }

        //Get all enrollments
        const enrollments = await prisma.Module_Enrollments.findMany({
            where: {
                student_id: student_id,
                school_year: new Date().getFullYear(),
            },
            select: {
                grade: true,
                no_of_absences: true,
                module: {
                    select: {
                        school_year: true,
                        session_1: true,
                        session_2: true,
                        teacher: {
                            select: {
                                first_name: true,
                                last_name: true,
                            },
                        },
                        details: {
                            select: {
                                module_name: true,
                                program: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                module: {
                    module_name: "asc",
                },
            },
        });

        res.status(200).send(enrollments);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get finance related module enrollment info from a student
ModuleEnrollmentsRouter.get("/balance/:student_id", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get student_id from req.params
        const { student_id } = req.params;

        const finance_info = await prisma.Module_Enrollments.findMany({
            where: {
                student_id: student_id,
            },
            select: {
                module_name: true,
                school_year: true,
                bill: {
                    select: {
                        bill_no: true,
                        fee: true,
                        deductions: true,
                        status: true,
                        issued_on: true,
                        remarks: true,
                        payments: {
                            select: {
                                or_no: true,
                                payment: true,
                                remarks: true,
                                paid_on: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(200).send(finance_info);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all passed enrollments of a student
ModuleEnrollmentsRouter.get("/passed/:student_id", async (req, res) => {
    if (!allowed(req.permission, [1, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get student_id from req.params
        const { student_id } = req.params;

        //Get all enrollments
        const enrollments = await prisma.Module_Enrollments.findMany({
            where: {
                student_id: student_id,
                status: "PASSED",
            },
            select: {
                grade: true,
                no_of_absences: true,
                module: {
                    select: {
                        school_year: true,
                        session_1: true,
                        session_2: true,
                        teacher: {
                            select: {
                                first_name: true,
                                last_name: true,
                            },
                        },
                        details: {
                            select: {
                                module_name: true,
                                program: true,
                            },
                        },
                    },
                },
                orderBy: {
                    module: {
                        module_name: "asc",
                    },
                },
            },
        });

        res.status(200).send(enrollments);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all enrollments in a year
ModuleEnrollmentsRouter.get("/enrollments/:school_year", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get school year in int
        const school_year = parseInt(req.params.school_year);

        //Get all enrollments
        const enrollments = await prisma.Module_Enrollments.findMany({
            where: {
                school_year: school_year,
            },
            select: {
                module_name: true,
                school_year: true,
                grade: true,
                status: true,
                student: {
                    select: {
                        student_id: true,
                        first_name: true,
                        last_name: true,
                        middle_name: true,
                        email: true,
                    },
                },
                no_of_absences: true,
            },
            orderBy: {
                student: {
                    student_id: "asc",
                },
            },
        });

        res.status(200).send(enrollments);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all for approval enrollments
ModuleEnrollmentsRouter.get("/approval", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get all enrollments
        const enrollments = await prisma.Module_Enrollments.findMany({
            where: {
                status: "PENDING_APPROVAL",
            },
            select: {
                module_name: true,
                school_year: true,
                status: true,
                student: {
                    select: {
                        student_id: true,
                        first_name: true,
                        last_name: true,
                        middle_name: true,
                    },
                },
            },
            orderBy: {
                student: {
                    student_id: "asc",
                },
            },
        });

        res.status(200).send(enrollments);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all enrollments in a module
ModuleEnrollmentsRouter.get("/enrollments/:module_name/:school_year", async (req, res) => {
    if (!allowed(req.permission, [2, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get params
        const { module_name } = req.params;
        const school_year = parseInt(req.params.school_year);

        //Validation if the teacher is allowed to view this record
        let enrollments = [];
        if (req.permission === 2) {
            enrollments = await prisma.Module_Enrollments.findMany({
                where: {
                    module_name: module_name,
                    school_year: school_year,
                    teacher_id: req.user.id,
                },
                select: {
                    student: {
                        select: {
                            student_id: true,
                            first_name: true,
                            middle_name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                    grade: true,
                    no_of_absences: true,
                    remarks: true,
                    status: true,
                    updated_at: true,
                    date_submitted: true,
                    date_received: true,
                },
                orderBy: {
                    student: {
                        student_id: "asc",
                    },
                },
            });
        } else {
            enrollments = await prisma.Module_Enrollments.findMany({
                where: {
                    module_name: module_name,
                    school_year: school_year,
                },
                select: {
                    student: {
                        select: {
                            student_id: true,
                            first_name: true,
                            middle_name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                    grade: true,
                    no_of_absences: true,
                    remarks: true,
                },
                orderBy: {
                    student: {
                        student_id: "asc",
                    },
                },
            });
        }

        res.status(200).send(enrollments);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/* POST Endpoints */
//Create a new enrollment
ModuleEnrollmentsRouter.post("/", validateEnrollmentReqBody(), async (req, res) => {
    if (!allowed(req.permission, [1, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    //Validate Modules Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get enrollment from req.body
        let enrollment = cleanEnrollmentObject(req.body);

        // Parse for correct data types
        enrollment = parser(enrollment);

        // Check if enrollment exists
        if (await exists(enrollment.student_id, enrollment.module_name, enrollment.school_year)) {
            throw new Error("Enrollment already exists");
        }

        if (req.permission === 1) {
            //Remove some fields if a student is making the request
            enrollment = exclude(enrollment, [
                "status",
                "bill_no",
                "grade",
                "date_submitted",
                "date_received",
                "record",
            ]);
        }

        // Create enrollment in database
        const createdEnrollment = await prisma.Module_Enrollments.create({
            data: enrollment,
        });

        // Get enrolling student
        const enrollingStudent = await prisma.Students.findUnique({
            where: {
                student_id: createdEnrollment.student_id,
            },
            select: {
                first_name: true,
                middle_name: true,
                last_name: true,
                email: true,
            },
        });

        // Send email to admin
        sendEmail(
            adminStudentModuleEnrollmentEmail(
                `${enrollingStudent.first_name} ${enrollingStudent.last_name}`,
                enrollingStudent.email,
                createdEnrollment.student_id,
                createdEnrollment.module_name
            )
        );

        // Return created enrollment
        res.status(200).send(createdEnrollment);
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

/* PATCH Endpoints */
// Edit full enrollment info
ModuleEnrollmentsRouter.patch(
    "/:student_id/:module_name/:school_year",
    validateEnrollmentReqBody(),
    async (req, res) => {
        if (!allowed(req.permission, [3])) {
            res.status(403).send({ error: "You are not authorized to access this" });
            return;
        }

        //Validate Modules Info
        const result = validationResult(req);
        if (!result.isEmpty()) {
            // Return errors if any
            return res.status(400).send({ errors: result.array() });
        }

        try {
            //Get student_id and module_name from req.params
            const { student_id, module_name } = req.params;

            //Convert school year to int
            const school_year = parseInt(req.params.school_year);

            // Check if enrollment exists
            if (!(await exists(student_id, module_name, school_year))) {
                throw new Error("Enrollment does not exist");
            }

            //Clean enrollment object
            let updatedData = cleanEnrollmentObject(req.body);

            // Parse for correct data types
            updatedData = parser(updatedData);

            // Update enrollment in database
            await prisma.Module_Enrollments.update({
                where: {
                    student_id_module_name_school_year: { student_id, module_name, school_year },
                },
                data: updatedData,
            });

            // Return updated enrollment
            res.status(200).send({ message: "Enrollment information successfully edited" });
        } catch (error) {
            // Return error
            res.status(500).send({ error: error.message });
        }
    }
);

ModuleEnrollmentsRouter.patch("/status/:student_id/:module_name/:school_year", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get student_id and module_name from req.params
        const { student_id, module_name } = req.params;

        //Convert school year to int
        const school_year = parseInt(req.params.school_year);

        // Check if enrollment exists
        if (!(await exists(student_id, module_name, school_year))) {
            throw new Error("Enrollment does not exist");
        }

        //Clean enrollment object
        let updatedData = { status: req.body.status };

        // Parse for correct data types
        updatedData = parser(updatedData);

        // Update enrollment in database
        await prisma.Module_Enrollments.update({
            where: {
                student_id_module_name_school_year: { student_id, module_name, school_year },
            },
            data: updatedData,
        });

        // Return updated enrollment
        res.status(200).send({ message: "Enrollment information successfully edited" });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

//Edit final grade
ModuleEnrollmentsRouter.patch(
    "/grade/:student_id/:module_name/:school_year",
    validateEditGradeReqBody(),
    async (req, res) => {
        if (!allowed(req.permission, [2, 3])) {
            res.status(403).send({ error: "You are not authorized to access this" });
            return;
        }

        //Validate Grade Info
        const result = validationResult(req);
        if (!result.isEmpty()) {
            // Return errors if any
            return res.status(400).send({ errors: result.array() });
        }

        try {
            //Get student_id and module_name from req.params
            const { student_id, module_name } = req.params;

            //Convert school year to int
            const school_year = parseInt(req.params.school_year);

            if (req.permission === 2) {
                const teacher = await prisma.Modules.findUnique({
                    where: {
                        module_name_school_year: { module_name, school_year },
                    },
                    select: {
                        teacher_id: true,
                    },
                });

                if (teacher.teacher_id !== req.user.user_id) {
                    res.status(403).send({ error: "You are not authorized to access this" });
                }
            }

            // Check if enrollment exists
            if (!(await exists(student_id, module_name, school_year))) {
                throw new Error("Enrollment does not exist");
            }

            //Clean enrollment object
            let updatedData = cleanEditGradeObject(req.body);

            // Parse for correct data types
            updatedData = parser(updatedData);

            updatedData["date_submitted"] = new Date();

            // Update enrollment in database
            await prisma.Module_Enrollments.update({
                where: {
                    student_id_module_name_school_year: { student_id, module_name, school_year },
                },
                data: updatedData,
            });

            // Return updated enrollment
            res.status(200).send({ message: "Grade successfully changed" });
        } catch (error) {
            // Return error
            res.status(500).send({ error: error.message });
        }
    }
);

/* DELETE Endpoints */
//Delete an enrollment
ModuleEnrollmentsRouter.delete("/:student_id/:module_name/:school_year", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get student_id and module_name from req.params
        const { student_id, module_name } = req.params;

        //Convert school year to int
        const school_year = parseInt(req.params.school_year);

        // Check if enrollment exists
        if (!(await exists(student_id, module_name, school_year))) {
            throw new Error("Enrollment does not exist");
        }

        await prisma.Module_Enrollments.delete({
            where: {
                student_id_module_name_school_year: { student_id, module_name, school_year },
            },
        });

        res.status(200).send({
            message:
                "Deletion of Student: " +
                student_id +
                "'s Enrollment for " +
                module_name +
                " " +
                school_year +
                " successful",
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default ModuleEnrollmentsRouter;
