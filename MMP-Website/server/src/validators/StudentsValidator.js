// Import Modules
import { checkSchema } from "express-validator";

// Student Schema
const studentSchema = {
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
    address: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 2, max: 150 },
            errorMessage: "Address should be between 2 and 150 characters long",
        },
    },
    mobile_number: {
        trim: true,
        notEmpty: true,
        isLength: {
            options: { min: 11, max: 11 },
            errorMessage: "Mobile number should be 11 digits long",
        },
        custom: {
            options: (value) => {
                if (!value.startsWith("09")) {
                    throw new Error("Mobile number should start with '09'");
                }
                return true;
            },
        },
    },
    landline: {
        trim: true,
        notEmpty: true,
        isLength: {
            options: { min: 8, max: 8 },
            errorMessage: "Landline should be 8 digits long",
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
    birthdate: {
        trim: true,
        notEmpty: true,
        isISO8601: true,
    },
    birthplace: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 2, max: 150 },
            errorMessage: "Birthplace should be between 2 and 150 characters long",
        },
    },
    nationality: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 2, max: 50 },
            errorMessage: "Nationality should be between 2 and 50 characters long",
        },
    },
    gender: {
        trim: true,
        notEmpty: true,
        isString: true,
        isIn: {
            options: [["MALE", "FEMALE", "OTHERS"]],
            errorMessage: "Gender should be 'MALE', 'FEMALE', or 'OTHERS'",
        },
    },
    civil_status: {
        trim: true,
        notEmpty: true,
        isString: true,
        isIn: {
            options: [["SINGLE", "MARRIED", "WIDOWED", "ANNULLED"]],
            errorMessage: "Civil status should be 'SINGLE', 'MARRIED', 'WIDOWED', or 'ANNULLED'",
        },
    },
    no_of_children: {
        trim: true,
        notEmpty: true,
        isInt: true,
        isLength: {
            options: { min: 1, max: 2 },
            errorMessage: "Number of children should be between 1 and 2 digits long",
        },
    },
    school: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 2, max: 30 },
            errorMessage: "School should be between 2 and 30 characters long",
        },
    },
    occupation: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 2, max: 30 },
            errorMessage: "Occupation should be between 2 and 30 characters long",
        },
    },
    admin: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 2, max: 150 },
            errorMessage: "Admin name should be between 2 and 150 characters long",
        },
    },
    church: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 2, max: 150 },
            errorMessage: "Church name should be between 2 and 150 characters long",
        },
    },
    pastor: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 2, max: 150 },
            errorMessage: "Pastor name should be between 2 and 150 characters long",
        },
    },
    is_partner_school: {
        trim: true,
        notEmpty: true,
        isBoolean: true,
    },
    gradeschool: {
        trim: true,
        isString: true,
        isLength: {
            options: { max: 50 },
            errorMessage: "Gradeschool should be less than 50 characters long",
        },
    },
    highschool: {
        trim: true,
        isString: true,
        isLength: {
            options: { max: 50 },
            errorMessage: "Highschool should be less than 50 characters long",
        },
    },
    college: {
        trim: true,
        isString: true,
        isLength: {
            options: { max: 50 },
            errorMessage: "College should be less than 50 characters long",
        },
    },
    college_course: {
        trim: true,
        isString: true,
        isLength: {
            options: { max: 50 },
            errorMessage: "College course name should be less than 50 characters long",
        },
    },
    graduate: {
        trim: true,
        isString: true,
        isLength: {
            options: { max: 50 },
            errorMessage: "Graduate should be less than 50 characters long",
        },
    },
    graduate_course: {
        trim: true,
        isString: true,
        isLength: {
            options: { max: 50 },
            errorMessage: "Graduate course name should be less than 50 characters long",
        },
    },
    others: {
        trim: true,
        isString: true,
        isLength: {
            options: { max: 200 },
            errorMessage: "Others should be less than 200 characters long",
        },
    },
    gradeschool_completed: {
        trim: true,
        notEmpty: true,
        isBoolean: true,
    },
    highschool_completed: {
        trim: true,
        notEmpty: true,
        isBoolean: true,
    },
    college_completed: {
        trim: true,
        notEmpty: true,
        isBoolean: true,
    },
    graduate_completed: {
        trim: true,
        notEmpty: true,
        isBoolean: true,
    },
    essay: {
        trim: true,
        notEmpty: true,
        isString: true,
    },
    emergency_name: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { max: 150 },
            errorMessage: "Emergency name should be less than 150 characters long",
        },
    },
    emergency_address: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { max: 150 },
            errorMessage: "Emergency address should be less than 150 characters long",
        },
    },
    emergency_mobile_number: {
        trim: true,
        notEmpty: true,
        isLength: {
            options: { min: 11, max: 11 },
            errorMessage: "Emergency mobile number should be 11 digits long",
        },
        custom: {
            options: (value) => {
                if (!value.startsWith("09")) {
                    throw new Error("Emergency mobile number should start with '09'");
                }
                return true;
            },
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
    status: {
        trim: true,
        notEmpty: true,
        isString: true,
        isIn: {
            options: [["ACTIVE", "GRADUATED", "WITHDRAWN", "REJECTED", "FOR_APPROVAL"]],
            errorMessage:
                "Status should be 'ACTIVE', 'GRADUATED', 'WITHDRAWN', 'REJECTED', or 'FOR_APPROVAL'",
        },
    },
    track: {
        trim: true,
        notEmpty: true,
        isString: true,
        isIn: {
            options: [["ADMIN", "TEACHER", "BOTH"]],
            errorMessage: "Status should be 'ADMIN', 'TEACHER', or 'BOTH'",
        },
    },
};

const statusSchema = {
    status: {
        trim: true,
        notEmpty: true,
        isString: true,
        isIn: {
            options: [["ACTIVE", "GRADUATED", "WITHDRAWN", "FOR_APPROVAL", "REJECTED"]],
            errorMessage:
                "Status should be 'ACTIVE', 'GRADUATED', 'WITHDRAWN', 'REJECTED', or 'FOR_APPROVAL'",
        },
    },
};

// Student Schema Validator
export const validateStudentReqBody = () => checkSchema(studentSchema, ["body"]);
// Status Schema Validator
export const validateStatusReqBody = () => checkSchema(statusSchema, ["body"]);

// Student Object Cleaner
export const cleanStudentObject = (studentObject) => {
    // JSON Object Allowed Fields
    const fields = [
        "first_name",
        "last_name",
        "middle_name",
        "address",
        "mobile_number",
        "landline",
        "email",
        "birthdate",
        "birthplace",
        "nationality",
        "gender",
        "civil_status",
        "no_of_children",
        "school",
        "occupation",
        "admin",
        "is_partner_school",
        "gradeschool",
        "highschool",
        "college",
        "graduate",
        "others",
        "gradeschool_completed",
        "highschool_completed",
        "college_completed",
        "graduate_completed",
        "essay",
        "church",
        "pastor",
        "graduate_course",
        "college_course",
        "emergency_name",
        "emergency_address",
        "emergency_mobile_number",
        "password",
        "status",
        "track",
    ];

    let cleanedObject = {};

    for (const field of fields) {
        cleanedObject[field] = studentObject[field];
    }

    return cleanedObject;
};

export const cleanStatusObject = (object) => {
    return { status: object["status"] };
};
