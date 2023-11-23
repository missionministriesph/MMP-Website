// Imports Modules
import express from "express";
import { validationResult } from "express-validator";
import {
    validateTORRequestReqBody,
    cleanTORRequestObject,
    validateStatusReqBody,
    cleanStatusObject,
} from "../validators/TORRequestsValidator.js";
import { db as prisma } from "../utils/db.server.js";
import { allowed } from "../utils/helpers.js";
import { sendEmail } from "../utils/email_service.js";
import { 
    adminTORRequestEmail
} from "../utils/email_templates.js";

// Express Router
const TORRequestsRouter = express.Router();

/* Helper Functions */
// Check if TOR Request Exists
const exists = async (req_id) => {
    const requestEntry = await prisma.TOR_Requests.findUnique({
        where: {
            req_id: req_id,
        },
    });

    if (requestEntry == null) {
        return false;
    } else {
        return true;
    }
};

// Generate requestID
const generateRequestID = async () => {
    // ID Format: YYYY-AAAAA
    const currentYear = new Date().getFullYear().toString();

    // Get all req_ids of the current year
    const requestEntries = (
        await prisma.TOR_Requests.findMany({
            select: {
                req_id: true,
            },
            where: {
                req_id: {
                    startsWith: currentYear,
                },
            },
            orderBy: {
                req_id: "asc",
            },
        })
    ).map((element) => {
        return element.req_id;
    });

    //If last req id is null
    if (requestEntries.length === 0) {
        return currentYear + "-00000";
    }

    //Get the last request id
    const id_list = requestEntries.map((element) => parseInt(element.substring(5)));
    let max = 0;
    for (const num of id_list) {
        if (num > max) {
            max = num;
        }
    }

    if (max < 99999) {
        const id_segment = (max + 1).toString().padStart(5, "0");
        return currentYear + "-" + id_segment;
    }

    //Throw an error if the id number overflows. This happens when the number of requests exceeds 99999 per year
    throw new Error("ID Overflow!");
};

/* Controllers */
/* GET Endpoints */
// Get a TOR Request
TORRequestsRouter.get("/:req_id", async (req, res) => {
    if (!allowed(req.permission, [1, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get req_id from req.params
        const { req_id } = req.params;

        // Check if tor_request exists
        if (!(await exists(req_id))) {
            throw new Error("TOR Request does not exist");
        }

        // Get tor_request from database
        const tor_request = await prisma.TOR_Requests.findUnique({
            where: {
                req_id: req_id,
            },
            select: {
                req_id: true,
                status: true,
                request_date: true,
                student: {
                    select: {
                        student_id: true,
                        first_name: true,
                        last_name: true,
                        middle_name: true,
                    },
                },
            },
        });

        // Return tor_request
        res.status(200).send(tor_request);
    } catch (error) {
        // Return error
        res.status(404).send({ error: error.message });
    }
});

// Get all TOR Requests
TORRequestsRouter.get("/", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get TOR requests

        const tor_requests = await prisma.TOR_Requests.findMany({
            select: {
                req_id: true,
                status: true,
                request_date: true,
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
                req_id: "asc",
            },
        });

        res.status(200).send(tor_requests);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all TOR Requests from a student
TORRequestsRouter.get("/students/:student_id", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get student_id
        const { student_id } = req.params;

        // Get TOR requests
        const tor_request = await prisma.TOR_Requests.findMany({
            where: {
                student_id: student_id,
            },
            select: {
                req_id: true,
                status: true,
                request_date: true,
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
                req_id: "asc",
            },
        });

        res.status(200).send(tor_request);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all TOR Request for a certain year
TORRequestsRouter.get("/year/:year", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get year
        const { year } = req.params;

        // Get TOR requests
        const tor_requests = await prisma.TOR_Requests.findMany({
            where: {
                AND: [
                    {
                        request_date: {
                            gte: new Date(year + "-01-01"),
                        },
                    },
                    {
                        request_date: {
                            lt: new Date((parseInt(year) + 1).toString() + "-01-01"),
                        },
                    },
                ],
            },
            select: {
                req_id: true,
                status: true,
                request_date: true,
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
                req_id: "asc",
            },
        });

        res.status(200).send(tor_requests);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all TOR Requests of a certain status
TORRequestsRouter.get("/all/:status", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get status
        const { status } = req.params;

        // Get TOR requests
        const tor_requests = await prisma.TOR_Requests.findMany({
            where: {
                status: status.toUpperCase(),
            },
            select: {
                req_id: true,
                status: true,
                request_date: true,
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
                req_id: "asc",
            },
        });

        res.status(200).send(tor_requests);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/* POST Endpoints */
// Create TOR Request
TORRequestsRouter.post("/", validateTORRequestReqBody(), async (req, res) => {
    if (!allowed(req.permission, [1, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate TOR Request Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get tor_request from req.body
        const tor_request = cleanTORRequestObject(req.body);

        // Generate req_id
        tor_request.req_id = await generateRequestID();
        tor_request.status = "PENDING";
        tor_request.request_date = new Date();

        // Create tor_request in database
        await prisma.TOR_Requests.create({ data: tor_request });

        // Get requesting student info
        const requestingStudent = await prisma.Students.findUnique({
            where: {
                student_id: tor_request.student_id,
            },
            select: {
                first_name: true,
                last_name: true,
                middle_name: true,
                email: true,
            },
        });

        // Send email to admin
        sendEmail(adminTORRequestEmail(`${requestingStudent.first_name} ${requestingStudent.last_name}`, requestingStudent.email, tor_request.student_id, tor_request.request_date))

        res.status(200).send({ message: "Create successful" });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

/* UPDATE Endpoints */
// Update TOR Request
TORRequestsRouter.patch("/:req_id", validateStatusReqBody(), async (req, res) => {
    if (!allowed(req.permission, [1, 2, 3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate TOR Request Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get req_id from req.params
        const { req_id } = req.params;

        // Check if tor_request exists
        if (!(await exists(req_id))) {
            throw new Error("TOR Request does not exist");
        }

        // Get updated info from req.body
        const updatedData = cleanStatusObject(req.body);

        // Update tor_request in database
        await prisma.TOR_Requests.update({
            where: {
                req_id: req_id,
            },
            data: updatedData,
        });

        res.status(200).send({ message: "Update successful" });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

/* DELETE Endpoints */
//Delete TOR Request
TORRequestsRouter.delete("/:req_id", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get req_id from req.params
        const { req_id } = req.params;

        // Check if tor_request exists
        if (!(await exists(req_id))) {
            throw new Error("TOR Request does not exist");
        }

        // Delete record
        await prisma.TOR_Requests.delete({
            where: {
                req_id: req_id,
            },
        });

        // Return tor_request
        res.status(200).send({
            message:
                "Request with id '" + req_id + "' has been successfully deleted from the database",
        });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

// Export Router
export default TORRequestsRouter;
