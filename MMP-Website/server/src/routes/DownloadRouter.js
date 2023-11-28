// Imports Modules
import express from "express";
import { db as prisma } from "../utils/db.server.js";
import JSZip from "jszip";
import { parse as parseToCSV } from "json2csv";
import { exclude, allowed } from "../utils/helpers.js";

// Express Router
const DownloadRouter = express.Router();

/* Helpers */
const excludePasswordDates = (object) => {
    return exclude(object, ["password", "created_at", "updated_at"]);
};

/* Controllers */

/* GET Endpoints */

// Download All Tables as Zipped CSVs
DownloadRouter.get("/all", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(401).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const zip = new JSZip();

        // Get All Tables
        let database = {
            students: await prisma.Students.findMany({}),
            bills: await prisma.Bills.findMany({}),
            admins: await prisma.Admins.findMany({}),
            teachers: await prisma.Teachers.findMany({}),
            payments: await prisma.Payments.findMany({}),
            modules: await prisma.Modules.findMany({}),
            module_enrollments: await prisma.Module_Enrollments.findMany({}),
            tor_requests: await prisma.TOR_Requests.findMany({}),
            module_details: await prisma.Module_Details.findMany({}),
            module_names: await prisma.Module_Names.findMany({}),
        };

        // Exclude password and dates
        database = Object.fromEntries(
            Object.entries(database).map(([key, value]) => [key, value.map(excludePasswordDates)])
        );

        // For each table, export as CSV
        for (const [key, value] of Object.entries(database)) {
            exclude(value, ["password", "created_at", "updated_at"]);
            try {
                if (value) {
                    // Check if value array is not empty
                    zip.file(`${key}.csv`, parseToCSV(value));
                } else {
                    console.log(`No ${key} in the database`);
                }
            } catch (err) {
                console.error("Problem exporting " + key + ": " + err);
            }
        }

        const blob = await zip.generateAsync({ type: "base64" });
        console.log(`ADMIN [${req.user.user_id}] EXPORTED the database`);

        res.send(blob);
    } catch (error) {
        // Return error
        res.status(404).send({ error: error.message });
    }
});

// Download All Module Data as Zipped CSVs
DownloadRouter.get("/modules", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(401).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const zip = new JSZip();

        // Get All Combinations of Module Names and School Years
        const modules = await prisma.Modules.findMany({
            select: {
                module_name: true,
                school_year: true,
            },
            orderBy: {
                school_year: "desc",
            },
        });

        // Empty enrollment object for modules with no enrollments
        const empty_enrollment = {
            student_id: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            email: "",
            grade: "",
            no_of_absences: "",
            remarks: "",
        };
        
        // For each module, get all enrollments
        await Promise.all(
            modules.map(async (module) => {
                let enrollments = await prisma.Module_Enrollments.findMany({
                    where: {
                        module_name: module.module_name,
                        school_year: module.school_year,
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

                // Format Module Enrollments
                enrollments.forEach((enrollment) => {
                    enrollment.student_id = enrollment.student.student_id;
                    enrollment.first_name = enrollment.student.first_name;
                    enrollment.middle_name = enrollment.student.middle_name;
                    enrollment.last_name = enrollment.student.last_name;
                    enrollment.email = enrollment.student.email;
                    delete enrollment.student;
                });

                // Reorder Module Enrollment Columns
                enrollments = enrollments.map((enrollment) => {
                    return {
                        student_id: enrollment.student_id,
                        first_name: enrollment.first_name,
                        middle_name: enrollment.middle_name,
                        last_name: enrollment.last_name,
                        email: enrollment.email,
                        grade: enrollment.grade,
                        no_of_absences: enrollment.no_of_absences,
                        remarks: enrollment.remarks,
                    };
                });

                // For each table, export as CSV
                try {
                    // Check if enrollments array is not empty
                    if (enrollments.length > 0) {
                        // Parse json to csv and add to zip
                        zip.file(
                            `${module.module_name} ${module.school_year}.csv`,
                            parseToCSV(enrollments)
                        );
                    } else {
                        // Add csv with only keys to zip
                        zip.file(
                            `${module.module_name} ${module.school_year}.csv`,
                            parseToCSV([empty_enrollment])
                        );
                    }
                } catch (err) {
                    console.error(
                        "Problem exporting " +
                            module.module_name +
                            " " +
                            module.school_year +
                            ": " +
                            err
                    );
                }
            })
        );

        const blob = await zip.generateAsync({ type: "base64" });
        console.log(`ADMIN [${req.user.user_id}] EXPORTED the database`);

        res.send(blob);
    } catch (error) {
        // Return error
        res.status(404).send({ error: error.message });
    }
});

// Download Year Module Data as Zipped CSVs
DownloadRouter.get("/modules/:school_year", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(401).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const school_year = parseInt(req.params.school_year);
        const zip = new JSZip();

        // Get All Combinations of Module Names in the Year
        const modules = await prisma.Modules.findMany({
            where: {
                school_year: school_year,
            },
            select: {
                module_name: true,
                school_year: true,
            },
            orderBy: {
                school_year: "desc",
            },
        });

        // Empty enrollment object for modules with no enrollments
        const empty_enrollment = {
            student_id: "",
            first_name: "",
            middle_name: "",
            last_name: "",
            email: "",
            grade: "",
            no_of_absences: "",
            remarks: "",
        };
        
        // For each module, get all enrollments
        await Promise.all(
            modules.map(async (module) => {
                let enrollments = await prisma.Module_Enrollments.findMany({
                    where: {
                        module_name: module.module_name,
                        school_year: module.school_year,
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

                // Format Module Enrollments
                enrollments.forEach((enrollment) => {
                    enrollment.student_id = enrollment.student.student_id;
                    enrollment.first_name = enrollment.student.first_name;
                    enrollment.middle_name = enrollment.student.middle_name;
                    enrollment.last_name = enrollment.student.last_name;
                    enrollment.email = enrollment.student.email;
                    delete enrollment.student;
                });

                // Reorder Module Enrollment Columns
                enrollments = enrollments.map((enrollment) => {
                    return {
                        student_id: enrollment.student_id,
                        first_name: enrollment.first_name,
                        middle_name: enrollment.middle_name,
                        last_name: enrollment.last_name,
                        email: enrollment.email,
                        grade: enrollment.grade,
                        no_of_absences: enrollment.no_of_absences,
                        remarks: enrollment.remarks,
                    };
                });

                // For each table, export as CSV
                try {
                    // Check if enrollments array is not empty
                    if (enrollments.length > 0) {
                        // Parse json to csv and add to zip
                        zip.file(
                            `${module.module_name} ${module.school_year}.csv`,
                            parseToCSV(enrollments)
                        );
                    } else {
                        // Add csv with only keys to zip
                        zip.file(
                            `${module.module_name} ${module.school_year}.csv`,
                            parseToCSV([empty_enrollment])
                        );
                    }
                } catch (err) {
                    console.error(
                        "Problem exporting " +
                            module.module_name +
                            " " +
                            module.school_year +
                            ": " +
                            err
                    );
                }
            })
        );

        const blob = await zip.generateAsync({ type: "base64" });
        console.log(`ADMIN [${req.user.user_id}] EXPORTED the database`);

        res.send(blob);
    } catch (error) {
        // Return error
        res.status(404).send({ error: error.message });
    }
});

// Download All Data of a Student as Zipped CSVs
DownloadRouter.get("/student/:student_id", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(401).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const student_id = req.params.student_id;

        const zip = new JSZip();

        // Get All Tables
        let student_data = {
            student: await prisma.Students.findUnique({
                where: {
                    student_id: student_id,
                },
            }),
            module_enrollments: await prisma.Module_Enrollments.findMany({
                where: {
                    student_id: student_id,
                },
                select: {
                    status: true,
                    grade: true,
                    no_of_absences: true,
                    remarks: true,
                    module: {
                        select: {
                            school_year: true,
                            session_1: true,
                            session_2: true,
                            teacher: {
                                select: {
                                    first_name: true,
                                    middle_name: true,
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
            }),
        };

        // Format Student Data
        student_data.student = exclude(student_data.student, [
            "password",
            "created_at",
            "updated_at",
        ]);

        // Format Module Enrollments
        student_data.module_enrollments.forEach((enrollment) => {
            enrollment.module_name = enrollment.module.details.module_name;
            enrollment.school_year = enrollment.module.school_year;
            enrollment.program = enrollment.module.details.program;
            enrollment.teacher_first_name = enrollment.module.teacher.first_name;
            enrollment.teacher_middle_name = enrollment.module.teacher.middle_name;
            enrollment.teacher_last_name = enrollment.module.teacher.last_name;
            enrollment.session_1 = enrollment.module.session_1;
            enrollment.session_2 = enrollment.module.session_2;
            delete enrollment.module;
        });
        // Reorder Module Enrollment Columns
        student_data.module_enrollments = student_data.module_enrollments.map((enrollment) => {
            return {
                module_name: enrollment.module_name,
                school_year: enrollment.school_year,
                program: enrollment.program,
                teacher_first_name: enrollment.teacher_first_name,
                teacher_middle_name: enrollment.teacher_middle_name,
                teacher_last_name: enrollment.teacher_last_name,
                session_1: enrollment.session_1,
                session_2: enrollment.session_2,
                status: enrollment.status,
                grade: enrollment.grade,
                no_of_absences: enrollment.no_of_absences,
                remarks: enrollment.remarks,
            };
        });

        // For each table, export as CSV
        for (const [key, value] of Object.entries(student_data)) {
            try {
                // If value is an array and is empty
                if (Array.isArray(value) && value.length === 0) {
                    console.log(`No ${key} for ${student_id}`);
                } else {
                    // Check if value array is not empty
                    zip.file(`${key}.csv`, parseToCSV(value));
                }
            } catch (err) {
                console.error("Problem exporting " + key + ": " + err);
            }
        }

        const blob = await zip.generateAsync({ type: "base64" });
        console.log(`ADMIN [${req.user.user_id}] EXPORTED the database`);

        res.send(blob);
    } catch (error) {
        // Return error
        res.status(404).send({ error: error.message });
    }
});

// Export Router
export default DownloadRouter;
