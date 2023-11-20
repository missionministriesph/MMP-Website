// Import Modules
import { checkSchema } from "express-validator";

const passwordSchema = {
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

export const validatePasswordBody = () => checkSchema(passwordSchema, ["body"]);

// Password Object Cleaner
export const cleanPasswordObject = (passwordObject) => {
    return { password: passwordObject.password };
};
