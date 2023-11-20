// Import Modules
import { checkSchema } from "express-validator";

//Module Scheme
const enrollmentSchema = {
    student_id: {
        trim: true,
        isString: true,
        isLength: {
            options: { min: 12, max: 12 },
            errorMessage: "Student ID must be 12 characters long",
        },
    },
    module_name: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
            options: { min: 5, max: 50 },
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
    status: {
        trim: true,
        notEmpty: true,
        isString: true,
        isIn: {
            options: [["PENDING_APPROVAL", "IN_PROGRESS", "CANCELLED", "PASSED", "FAILED"]],
            errorMessage:
                "Status should be either 'PENDING_APPROVAL', 'IN_PROGRESS', 'CANCELLED', 'PASSED', or 'FAILED'",
        },
    },
    bill_no: {
        trim: true,
        isString: true,
        optional: true,
        isLength: {
            options: { min: 11, max: 11 },
            errorMessage: "Bill No must be 11 characters long",
        },
    },
    grade: {
        trim: true,
        isString: true,
        optional: true,
        isIn: {
            options: [
                [
                    "1.00",
                    "1.25",
                    "1.50",
                    "1.75",
                    "2.00",
                    "2.25",
                    "2.50",
                    "2.75",
                    "3.00",
                    "5.00",
                    "INC",
                ],
            ],
            errorMessage: "Invalid grade format",
        },
    },
    date_submitted: {
        trim: true,
        isDate: true,
        optional: true,
    },
    date_received: {
        trim: true,
        isDate: true,
        optional: true,
    },
    no_of_absences: {
        trim: true,
        optional: true,
        isInt: {
            options: { min: 0, max: 2 },
            errorMessage: "Invalid number of absences",
        },
    },
    remarks: {
        trim: true,
        isString: true,
        optional: true,
        isLength: {
            options: { max: 200 },
            errorMessage: "Remarks must be at most 200 characters",
        },
    },
    record: {
        trim: true,
        isString: true,
        optional: true,
        isLength: {
            options: { max: 200 },
            errorMessage: "URI must be at most 200 characters",
        },
    },
};

const gradeSchema = {
    grade: {
        trim: true,
        isString: true,
        isIn: {
            options: [
                [
                    "1.00",
                    "1.25",
                    "1.50",
                    "1.75",
                    "2.00",
                    "2.25",
                    "2.50",
                    "2.75",
                    "3.00",
                    "5.00",
                    "INC",
                ],
            ],
            errorMessage: "Invalid grade format",
        },
    },
    no_of_absences: {
        trim: true,
        isInt: {
            options: { min: 0, max: 2 },
            errorMessage: "Invalid number of absences",
        },
    },
    remarks: {
        trim: true,
        isString: true,
        optional: true,
        isLength: {
            options: { max: 200 },
            errorMessage: "Remarks must be at most 200 characters",
        },
    },
};

// Module Enrollment Schema Validator
export const validateEnrollmentReqBody = () => checkSchema(enrollmentSchema, ["body"]);

// Module Enrollment Object Cleaner
export const cleanEnrollmentObject = (enrollmentObject) => {
    // JSON Allowed Fields
    const fields = [
        "student_id",
        "module_name",
        "school_year",
        "status",
        "bill_no",
        "grade",
        "date_submitted",
        "date_received",
        "record",
        "no_of_absences",
        "remarks",
    ];

    let cleanedObject = {};

    for (const field of fields) {
        cleanedObject[field] = enrollmentObject[field];
    }

    return cleanedObject;
};

// Grade Schema Validator
export const validateEditGradeReqBody = () => checkSchema(gradeSchema, ["body"]);

// Grade Object Cleaner
export const cleanEditGradeObject = (gradeObject) => {
    // JSON Allowed Fields
    const fields = ["grade", "no_of_absences", "remarks"];

    let cleanedObject = {};

    for (const field of fields) {
        cleanedObject[field] = gradeObject[field];
    }

    return cleanedObject;
};
