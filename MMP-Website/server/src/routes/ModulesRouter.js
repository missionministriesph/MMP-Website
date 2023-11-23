// Imports Modules
import express from "express";
import { validationResult } from "express-validator";
import {
    validateModuleReqBody,
    cleanModuleObject,
    validateEditTeacherReqBody,
    cleanTeacherEditObject,
} from "../validators/ModuleValidator.js";
import { db as prisma } from "../utils/db.server.js";
import { allowed } from "../utils/helpers.js";

// Express Router
const ModulesRouter = express.Router();

/* Helper Functions */
//Check for existence
const exists = async (module_name, school_year) => {
    const moduleEntry = await prisma.Modules.findUnique({
        where: {
            module_name_school_year: { module_name, school_year },
        },
    });

    if (moduleEntry == null) {
        return false;
    } else {
        return true;
    }
};

//Parse to correct data types
const parser = (object) => {
    object["school_year"] = parseInt(object["school_year"]);
    object["session_1"] = new Date(object["session_1"]);
    object["session_2"] = new Date(object["session_2"]);

    return object;
};

/* Controller */

/* GET Endpoints */
// Get a module
ModulesRouter.get("/module/:module_name/:school_year", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get module_name from req.params
        const { module_name } = req.params;

        //Convert school year to int
        const school_year = parseInt(req.params.school_year);

        // Check if module exists
        if (!(await exists(module_name, school_year))) {
            throw new Error("Module does not exist");
        }

        const module = await prisma.Modules.findUnique({
            where: {
                module_name_school_year: { module_name, school_year },
            },
            select: {
                school_year: true,
                teacher_id: true,
                session_1: true,
                session_2: true,
                details: {
                    select: {
                        module_name: true,
                        prerequisites: true,
                        description: true,
                        program: true,
                    },
                },
            },
        });

        res.status(200).send(module);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});

// Get all modules
ModulesRouter.get("/", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const modules = await prisma.Modules.findMany({
            select: {
                school_year: true,
                teacher: {
                    select: {
                        teacher_id: true,
                        first_name: true,
                        last_name: true,
                        middle_name: true,
                    },
                },
                session_1: true,
                session_2: true,
                details: {
                    select: {
                        module_name: true,
                        prerequisites: true,
                        description: true,
                        program: true,
                    },
                },
            },
            orderBy: [{ school_year: "desc" }, { module_name: "asc" }],
        });

        res.status(200).send(modules);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});

//Get all modules for this year
ModulesRouter.get("/school_year/:school_year", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get school year in int
        const school_year = parseInt(req.params.school_year);

        const modules = await prisma.Modules.findMany({
            where: {
                school_year: school_year,
            },
            select: {
                school_year: true,
                teacher: {
                    select: {
                        teacher_id: true,
                        first_name: true,
                        last_name: true,
                        middle_name: true,
                    },
                },
                session_1: true,
                session_2: true,
                details: {
                    select: {
                        module_name: true,
                        prerequisites: true,
                        description: true,
                        program: true,
                    },
                },
            },
            orderBy: {
                module_name: "asc",
            },
        });

        res.status(200).send(modules);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});

// Get all modules for a student to take
ModulesRouter.get("/student/:student_id", async (req, res) => {
    if (!allowed(req.permission, [1, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get student_id
        const { student_id } = req.params;

        if (req.permission === 1 && req.user.user_id !== student_id) {
            res.status(403).send({ error: "You are not authorized to access this" });
            return;
        }

        //Get all module names
        const names = (
            await prisma.Module_Names.findMany({
                select: {
                    module_name: true,
                },
                orderBy: {
                    module_name: "asc",
                },
            })
        ).map((element) => {
            return element.module_name;
        });

        //Get all modules passed by the student
        const passed = (
            await prisma.Module_Enrollments.findMany({
                select: {
                    module_name: true,
                },
                where: {
                    student_id: student_id,
                    status: "PASSED",
                },
                orderBy: {
                    module_name: "asc",
                },
            })
        ).map((element) => {
            return element.module_name;
        });

        //Get all modules currently being taken or is enrolled in by the student
        const in_progress = (
            await prisma.Module_Enrollments.findMany({
                select: {
                    module_name: true,
                },
                where: {
                    student_id: student_id,
                    OR: [{ status: "IN_PROGRESS" }, { status: "PENDING_APPROVAL" }],
                },
                orderBy: {
                    module_name: "asc",
                },
            })
        ).map((element) => {
            return element.module_name;
        });

        //Get all already taken modules this year
        const same_year = (
            await prisma.Module_Enrollments.findMany({
                where: {
                    school_year: new Date().getFullYear(),
                    student_id: student_id,
                },
            })
        ).map((element) => {
            return element.module_name;
        });

        //Get all the names of modules that are not taken yet
        const untaken = names
            .filter((element) => !passed.includes(element))
            .filter((element) => !in_progress.includes(element))
            .filter((element) => !same_year.includes(element));

        //Get all prerequisites
        const untaken_details = await prisma.Module_Details.findMany({
            where: {
                module_name: {
                    in: untaken,
                },
            },
            select: {
                module_name: true,
                prerequisites: true,
            },
            orderBy: {
                module_name: "asc",
            },
        });

        //Filter out for only the modules that can be taken
        const takeable = untaken_details
            .filter((element) => {
                for (const module of element.prerequisites) {
                    if (!passed.includes(module)) {
                        return false;
                    }
                }

                return true;
            })
            .map((element) => {
                return element.module_name;
            });

        //Get all the modules to be taken
        const modules = await prisma.Modules.findMany({
            where: {
                details: {
                    module_name: {
                        in: takeable,
                    },
                },
                school_year: new Date().getFullYear(),
            },
            select: {
                school_year: true,
                session_1: true,
                session_2: true,
                details: {
                    select: {
                        module_name: true,
                        program: true,
                    },
                },
                teacher: {
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
            },
            orderBy: {
                details: {
                    module_name: "asc",
                },
            },
        });

        res.status(200).send(modules);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});

// Get all modules of a program
ModulesRouter.get("/program/:program", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const { program } = req.params;

        const modules = await prisma.Modules.findMany({
            where: {
                details: {
                    some: {
                        program: program,
                    },
                },
            },
            select: {
                school_year: true,
                teacher: {
                    select: {
                        teacher_id: true,
                        first_name: true,
                        last_name: true,
                        middle_name: true,
                    },
                },
                session_1: true,
                session_2: true,
                details: {
                    select: {
                        module_name: true,
                        prerequisites: true,
                        description: true,
                        program: true,
                    },
                },
            },
            orderBy: [{ school_year: "desc" }, { module_name: "asc" }],
        });

        res.status(200).send(modules);
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});

//Retrieve all modules that a teacher is currently teaching
ModulesRouter.get("/teacher/:teacher_id", async (req, res) => {
    if (!allowed(req.permission, [2, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const { teacher_id } = req.params;

        if (req.permission === 2 && req.user.user_id !== teacher_id) {
            res.status(403).send({ error: "Unauthorized" });
        } else {
            const modules = await prisma.Modules.findMany({
                where: {
                    teacher_id: teacher_id,
                    school_year: new Date().getFullYear(),
                },
                select: {
                    school_year: true,
                    teacher: {
                        select: {
                            teacher_id: true,
                            first_name: true,
                            last_name: true,
                            middle_name: true,
                        },
                    },
                    session_1: true,
                    session_2: true,
                    details: {
                        select: {
                            module_name: true,
                            prerequisites: true,
                            description: true,
                            program: true,
                        },
                    },
                },
                orderBy: [{ school_year: "desc" }, { module_name: "asc" }],
            });
            res.status(200).send(modules);
        }
    } catch (error) {
        res.status(404).send({ error: error.message });
    }
});

//Get enrollment report for a module
ModulesRouter.get("/report/:module_name/:school_year", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get module_name from req.params
        const { module_name } = req.params;

        //Convert school year to int
        const school_year = parseInt(req.params.school_year);

        //Get data
        const data = await prisma.Modules.findUnique({
            where: {
                module_name_school_year: { module_name, school_year },
            },
            select: {
                school_year: true,
                session_1: true,
                session_2: true,
                teacher: {
                    select: {
                        teacher_id: true,
                        first_name: true,
                        last_name: true,
                        middle_name: true,
                    },
                },
                details: {
                    select: {
                        module_name: true,
                        program: true,
                    },
                },
                enrollments: {
                    select: {
                        student: {
                            select: {
                                student_id: true,
                                first_name: true,
                                last_name: true,
                                middle_name: true,
                            },
                        },
                        bill: {
                            select: {
                                bill_no: true,
                                fee: true,
                                deductions: true,
                                status: true,
                                remarks: true,
                                issued_on: true,
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
                },
            },
            orderBy: [
                { school_year: "desc" },
                { module_name: "asc" },
                {
                    enrollments: {
                        select: {
                            student: true,
                            bill: true,
                        },
                        orderBy: [{ student_id: "asc" }, { bill_no: "asc" }],
                    },
                },
            ],
        });

        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get enrollment report for all modules in a year
ModulesRouter.get("/report/:school_year", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Convert school year to int
        const school_year = parseInt(req.params.school_year);

        //Get data
        const data = await prisma.Modules.findMany({
            where: {
                school_year: school_year,
            },
            select: {
                module_name: true,
                school_year: true,
                session_1: true,
                session_2: true,
                program: true,
                teacher: {
                    select: {
                        teacher_id: true,
                        first_name: true,
                        last_name: true,
                        middle_name: true,
                    },
                },
                enrollments: {
                    select: {
                        student: {
                            select: {
                                student_id: true,
                                first_name: true,
                                last_name: true,
                                middle_name: true,
                            },
                        },
                        bill: {
                            select: {
                                bill_no: true,
                                fee: true,
                                deductions: true,
                                status: true,
                                remarks: true,
                                issued_on: true,
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
                },
            },
            orderBy: [
                { school_year: "desc" },
                { module_name: "asc" },
                {
                    enrollments: {
                        select: {
                            student: true,
                            bill: true,
                        },
                        orderBy: [{ student_id: "asc" }, { bill_no: "asc" }],
                    },
                },
            ],
        });

        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/* POST Endpoints */
// Add a new module
ModulesRouter.post("/", validateModuleReqBody(), async (req, res) => {
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
        // Get module from req.body
        const module = cleanModuleObject(req.body);

        // Check if module exists
        if (await exists(module.module_name, module.school_year)) {
            throw new Error("Module already exists");
        }

        // Parse for correct data types
        parser(module);

        // Create module in database
        const createdModule = await prisma.Modules.create({
            data: module,
        });

        // Return created module
        res.status(200).send(createdModule);
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

/* PATCH Endpoints */
// Edit an existing module
ModulesRouter.patch("/:module_name/:school_year", validateModuleReqBody(), async (req, res) => {
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
        //Get module_name from req.params
        const { module_name } = req.params;

        //Convert school year to int
        const school_year = parseInt(req.params.school_year);

        // Check if module exists
        if (!(await exists(module_name, school_year))) {
            throw new Error("Module does not exist");
        }

        const updatedData = parser(cleanModuleObject(req.body));

        // Update student in database
        const updatedModule = await prisma.Modules.update({
            where: {
                module_name_school_year: { module_name, school_year },
            },
            data: updatedData,
        });

        // Return updated student
        res.status(200).send(updatedModule);
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

ModulesRouter.patch(
    "/teacher/:module_name/:school_year",
    validateEditTeacherReqBody(),
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
            //Get module_name from req.params
            const { module_name } = req.params;

            //Convert school year to int
            const school_year = parseInt(req.params.school_year);

            // Check if module exists
            if (!(await exists(module_name, school_year))) {
                throw new Error("Module does not exist");
            }

            const updatedData = cleanTeacherEditObject(req.body);

            // Update student in database
            const updatedModule = await prisma.Modules.update({
                where: {
                    module_name_school_year: { module_name, school_year },
                },
                data: updatedData,
            });

            // Return updated student
            res.status(200).send(updatedModule);
        } catch (error) {
            // Return error
            res.status(500).send({ error: error.message });
        }
    }
);

/* DELETE Endpoints */
// Delete a module
ModulesRouter.delete("/:module_name/:school_year", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get module_name from req.params
        const { module_name } = req.params;

        //Convert school year to int
        const school_year = parseInt(req.params.school_year);

        // Check if module exists
        if (!(await exists(module_name, school_year))) {
            throw new Error("Module does not exist");
        }

        // Delete from database
        await prisma.Modules.delete({
            where: {
                module_name_school_year: { module_name, school_year },
            },
        });

        res.status(200).send({
            message: module_name + "-" + school_year + " has been successfully deleted",
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default ModulesRouter;
