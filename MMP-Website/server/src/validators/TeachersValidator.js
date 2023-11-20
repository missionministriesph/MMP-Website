// Import Modules
import { checkSchema } from "express-validator";

// teacher Schema
const teacherSchema = {
    first_name: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: "First name should be between 2 and 50 characters long",
        },
    },
    last_name: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: "Last name should be between 2 and 50 characters long",
        },
    },
    middle_name: {
        trim: true,
        notEmpty: true,
        isString: true,
        optional: true,
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: "Middle name should be between 2 and 50 characters long",
        },
    },
    email: {
        trim: true,
        notEmpty: true,
        isEmail: true,
        isLength: {
            options: { min: 5, max: 50 },
            errorMessage: "Email should be between 5 and 50 characters long",
        },
    },
    status: {
        trim: true,
        notEmpty: true,
        isString: true,
        isIn: {
            options: [["ACTIVE", "INACTIVE", "REJECTED", "FOR_APPROVAL"]],
            errorMessage:
                "Status should be either 'ACTIVE', 'INACTIVE', 'REJECTED' or 'FOR_APPROVAL'",
        },
    },
    password: {
        // Might need to make password more secure later on
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 8, max: 40 },
            errorMessage: "Password should be between 8 and 40 characters long",
        },
    },
};

//Status schema
const statusSchema = {
    status: {
        trim: true,
        notEmpty: true,
        isString: true,
        isIn: {
            options: [["ACTIVE", "INACTIVE", "REJECTED", "FOR_APPROVAL"]],
            errorMessage:
                "Status should be either 'ACTIVE', 'INACTIVE', 'REJECTED' or 'FOR_APPROVAL'",
        },
    },
};

// Teacher Schema Validator
export const validateTeacherReqBody = () => checkSchema(teacherSchema, ["body"]);
// Teacher Status Schema Validator
export const validateStatusReqBody = () => checkSchema(statusSchema, ["body"]);

// Teacher Object Cleaner
export const cleanTeacherObject = (teacherObject) => {
    // JSON Object Allowed Fields
    const fields = ["first_name", "last_name", "middle_name", "email", "status", "password"];

    let cleanedObject = {};

    for (const field of fields) {
        cleanedObject[field] = teacherObject[field];
    }

    return cleanedObject;
};
// Status Object Cleaner
export const cleanStatusUpdateObject = (object) => {
    // JSON Object Allowed Fields
    const fields = ["status"];

    let cleanedObject = {};

    for (const field of fields) {
        cleanedObject[field] = object[field];
    }

    return cleanedObject;
};
