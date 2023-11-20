// Imports Modules
import express from "express";
import { validationResult } from "express-validator";
import { validatePaymentReqBody, cleanPaymentObject } from "../validators/PaymentsValidator.js";
import { db as prisma } from "../utils/db.server.js";
import { allowed, generateFinancePKSegments } from "../utils/helpers.js";

// Express Router
const PaymentsRouter = express.Router();

/* Helper Functions */
// Check if payment exists
const exists = async (or_no) => {
    const paymentEntry = await prisma.Payments.findUnique({
        where: {
            or_no: or_no,
        },
    });

    if (paymentEntry == null) {
        return false;
    } else {
        return true;
    }
};

const parser = (object) => {
    object["paid_on"] = new Date(object["paid_on"]);

    return object;
};

const generateOR = async () => {
    const orList = (
        await prisma.Payments.findMany({
            select: {
                or_no: true,
            },
        })
    ).map((element) => {
        return element.or_no;
    });

    const segments = generateFinancePKSegments(orList);
    const castedSegments = [parseInt(segments.first), parseInt(segments.second)];

    if (castedSegments[1] + 1 > 999999999) {
        if (castedSegments[0] + 1 > 9) {
            throw new Error("OR Number Overflow");
        } else {
            return `${(castedSegments[0] + 1).toString()}-000000000`;
        }
    } else {
        return `${castedSegments[0].toString()}-${(castedSegments[1] + 1)
            .toString()
            .padStart(9, "0")}`;
    }
};

/* Controllers */

/* GET Endpoints */
// Get Payment
PaymentsRouter.get("/:or_no", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get or_no from req.params
        const { or_no } = req.params;

        // Check if payment exists
        if (!(await exists(or_no))) {
            throw new Error("Payment does not exist");
        }

        // Get payment from database
        const payment = await prisma.Payments.findUnique({
            where: {
                or_no: or_no,
            },
            select: {
                or_no: true,
                bill_no: true,
                payee: true,
                payment: true,
                remarks: true,
                paid_on: true,
            },
        });

        // Return payment
        res.status(200).send(payment);
    } catch (error) {
        // Return error
        res.status(404).send({ error: error.message });
    }
});

//Get all payments for a bill
PaymentsRouter.get("/bill/:bill_no", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get or_no from req.params
        const { bill_no } = req.params;

        // Get payment from database
        const payment = await prisma.Payments.findMany({
            where: {
                bill_no: bill_no,
            },
            select: {
                or_no: true,
                bill_no: true,
                payee: true,
                payment: true,
                remarks: true,
                paid_on: true,
            },
            orderBy: {
                or_no: "asc",
            },
        });

        // Return payment
        res.status(200).send(payment);
    } catch (error) {
        // Return error
        res.status(404).send({ error: error.message });
    }
});

/* POST Endpoints */
// Create Payment
PaymentsRouter.post("/", validatePaymentReqBody(), async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate Payment Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get payment from req.body
        const payment = parser(cleanPaymentObject(req.body));

        //Add or number
        payment.or_no = await generateOR();

        // Create payment in database
        await prisma.Payments.create({ data: payment });

        res.status(200).send({ message: "Create successful" });
    } catch (error) {
        // Return error
        res.status(500).send({ error: error.message });
    }
});

/* PATCH Endpoints */
// Update Payment
PaymentsRouter.patch("/:or_no", validatePaymentReqBody(), async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate Payment Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Get or_no from req.params
        const { or_no } = req.params;

        // Get updated info from req.body
        const updatedData = parser(cleanPaymentObject(req.body));

        // Update payment in database
        await prisma.Payments.update({
            where: {
                or_no: or_no,
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
// Delete Payment
PaymentsRouter.delete("/:or_no", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        // Get or_no from req.params
        const { or_no } = req.params;

        // Check if payment exists
        if (!(await exists(or_no))) {
            throw new Error("Payment does not exist");
        }

        // Delete payment from database
        await prisma.Payments.delete({
            where: {
                or_no: or_no,
            },
        });

        // Return response message
        res.status(200).send({
            message: "Payment with OR Number: " + or_no + " has been successfully deleted",
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Export Router
export default PaymentsRouter;
