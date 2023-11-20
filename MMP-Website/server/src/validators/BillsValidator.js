// Import Modules
import { checkSchema } from "express-validator";

//Bills Scheme
const billsSchema = {
    fee: {
        isCurrency: {
            options: {
                allow_negatives: false,
                decimal_separator: ".",
                allow_decimal: true,
                require_decimal: false,
                digits_after_decimal: [0, 1, 2],
            },
        },
    },
    deductions: {
        isCurrency: {
            options: {
                allow_negatives: false,
                decimal_separator: ".",
                allow_decimal: true,
                require_decimal: false,
                digits_after_decimal: [0, 1, 2],
            },
        },
    },
    billed_to: {
        trim: true,
        isString: true,
        isLength: {
            options: { min: 12, max: 12 },
            errorMessage: "Invalid id number format",
        },
    },
    status: {
        isIn: {
            options: [["FULLY_PAID", "PARTIALLY_PAID", "UNPAID"]],
            errorMessage: "Status should be either 'FULLY_PAID', 'PARTIALLY_PAID', or 'UNPAID'",
        },
    },
    remarks: {
        trim: true,
        isString: true,
        optional: true,
        isLength: {
            options: { max: 200 },
            errorMessage: "Remarks must be under 200 characters.",
        },
    },
    issued_on: {
        trim: true,
        notEmpty: true,
        isDate: true,
    },
};

// Bills Schema Validator
export const validateBillReqBody = () => checkSchema(billsSchema, ["body"]);

// Bills Object Cleaner
export const cleanBillObject = (billObject) => {
    // JSON Allowed Fields
    const fields = ["fee", "deductions", "billed_to", "status", "remarks", "issued_on"];

    let cleanedObject = {};

    for (const field of fields) {
        cleanedObject[field] = billObject[field];
    }

    return cleanedObject;
};
