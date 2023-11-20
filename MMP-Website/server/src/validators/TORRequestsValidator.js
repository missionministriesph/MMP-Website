// Import Modules
import { checkSchema } from "express-validator";

// TOR Requests Schema
const TORRequestSchema = {
    student_id: {
        trim: true,
        isString: true,
        isLength: {
            options: { min: 12, max: 12 },
            errorMessage: "Student id must be 12 characters long",
        },
    },
    status: {
        trim: true,
        notEmpty: true,
        isString: true,
        isIn: {
            options: [["PENDING", "REJECTED", "UNPAID", "SENT"]],
            errorMessage: "Status should be either 'PENDING', 'REJECTED', 'UNPAID', or 'SENT'",
        },
    },
};

const statusSchema = {
    status: {
        trim: true,
        notEmpty: true,
        isString: true,
        isIn: {
            options: [["PENDING", "REJECTED", "UNPAID", "SENT"]],
            errorMessage: "Status should be either 'PENDING', 'REJECTED', 'UNPAID', or 'SENT'",
        },
    },
};

// TOR Request Schema Validator
export const validateTORRequestReqBody = () => checkSchema(TORRequestSchema, ["body"]);
// Status Request Schema Validator
export const validateStatusReqBody = () => checkSchema(statusSchema, ["body"]);

// TOR Request Object Cleaner
export const cleanTORRequestObject = (TORRequestObject) => {
    // JSON Allowed Fields
    const fields = ["student_id", "status", "request_date"];

    let cleanedObject = {};

    for (const field of fields) {
        cleanedObject[field] = TORRequestObject[field];
    }

    return cleanedObject;
};

// TOR Status Object Cleaner
export const cleanStatusObject = (statusObject) => {
    return { status: statusObject["status"] };
};
