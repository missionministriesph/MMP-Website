// Import Modules
import { checkSchema } from "express-validator";

// Payments Schema
const paymentsSchema = {
    bill_no: {
        trim: true,
        isString: true,
        isLength: {
            options: { min: 11, max: 11 },
            errorMessage: "Invalid bill number format",
        },
    },
    payee: {
        trim: true,
        isString: true,
        isLength: {
            options: { min: 12, max: 12 },
            errorMessage: "Invalid id number format",
        },
    },
    payment: {
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
    remarks: {
        trim: true,
        isString: true,
        optional: true,
        isLength: {
            options: { max: 200 },
            errorMessage: "Remarks must be under 200 characters.",
        },
    },
    paid_on: {
        trim: true,
        notEmpty: true,
        isDate: true,
    },
};

// Payment Schema Validator
export const validatePaymentReqBody = () => checkSchema(paymentsSchema, ["body"]);

// Payment Object Cleaner
export const cleanPaymentObject = (paymentObject) => {
    // JSON Allowed Fields
    const fields = ["bill_no", "payee", "payment", "remarks", "paid_on"];

    let cleanedObject = {};

    for (const field of fields) {
        cleanedObject[field] = paymentObject[field];
    }

    return cleanedObject;
};
