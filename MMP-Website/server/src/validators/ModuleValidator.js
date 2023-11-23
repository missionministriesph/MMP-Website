// Import Modules
import { checkSchema } from "express-validator";

//Module Scheme
const moduleSchema = {
    module_name: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 5, max: 200 },
            errorMessage: "Module name should be between 5 and 50 characters long",
        },
    },
    school_year: {
        trim: true,
        isInt: true,
        isLength: {
            options: { min: 4, max: 4 },
            errorMessage: "Invalid school year format",
        },
    },
    teacher_id: {
        trim: true,
        isString: true,
        isLength: {
            options: { min: 12, max: 12 },
            errorMessage: "Teacher ID must be 12 characters long",
        },
    },
    session_1: {
        trim: true,
        notEmpty: true,
        isDate: true,
    },
    session_2: {
        trim: true,
        notEmpty: true,
        isDate: true,
    },
};

const teacherEditSchema = {
    teacher_id: {
        trim: true,
        isString: true,
        isLength: {
            options: { min: 12, max: 12 },
            errorMessage: "Teacher ID must be 12 characters long",
        },
    },
};

// Module Schema Validator
export const validateModuleReqBody = () => checkSchema(moduleSchema, ["body"]);

export const validateEditTeacherReqBody = () => checkSchema(teacherEditSchema, ["body"]);

// Module Object Cleaner
export const cleanModuleObject = (moduleObject) => {
    // JSON Allowed Fields
    const fields = ["module_name", "school_year", "teacher_id", "session_1", "session_2"];

    let cleanedObject = {};

    for (const field of fields) {
        cleanedObject[field] = moduleObject[field];
    }

    cleanedObject["school_year"] = parseInt(cleanedObject["school_year"]);

    return cleanedObject;
};

export const cleanTeacherEditObject = (editObject) => {
    return { teacher_id: editObject.teacher_id };
};
