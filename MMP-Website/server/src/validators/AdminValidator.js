// Import Modules
import { checkSchema } from "express-validator";

//Admin Schema
const adminSchema = {
    email: {
        trim: true,
        notEmpty: true,
        isEmail: true,
        isLength: {
            options: { min: 5, max: 50 },
            errorMessage: "Email should be between 5 and 50 characters long",
        },
    },
    password: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 8, max: 40 },
            errorMessage: "Password should be between 8 and 40 characters long",
        },
    },
};

// Admin Schema Validator
export const validateAdminReqBody = () => checkSchema(adminSchema, ["body"]);

// Admin Object Cleaner
export const cleanAdminObject = (adminObject) => {
    // JSON Allowed Fields
    const fields = ["email", "password"];

    let cleanedObject = {};

    for (const field of fields) {
        cleanedObject[field] = adminObject[field];
    }

    return cleanedObject;
};
