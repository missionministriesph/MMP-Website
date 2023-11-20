// Import Modules
import { checkSchema } from "express-validator";

//Details Schema
const detailsSchema = {
    module_name: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 5, max: 50 },
            errorMessage: "Module name should be between 5 and 50 characters long",
        },
    },
    prerequisites: {
        trim: true,
        isArray: true,
        optional: true,
        custom: {
            options: (value) => {
                const maxLength = 50;
                for (let i = 0; i < value.length; i++) {
                    if (value[i].length > maxLength) {
                        throw new Error(
                            `String at index ${i} should be less than ${maxLength} characters long`
                        );
                    }
                }
                return true;
            },
        },
    },
    description: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { max: 200 },
            errorMessage: "Module description should be at most 200 characters long",
        },
    },
};

// Details Schema Validator
export const validateDetailsReqBody = () => checkSchema(detailsSchema, ["body"]);

// Details Object Cleaner
export const cleanDetailsObject = (detailsObject) => {
    // JSON Allowed Fields
    const fields = ["module_name", "prerequisites", "description"];

    let cleanedObject = {};

    for (const field of fields) {
        cleanedObject[field] = detailsObject[field];
    }

    return cleanedObject;
};
