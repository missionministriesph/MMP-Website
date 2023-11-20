// Admin Email List
const adminEmail = process.env.EMAIL;

// Website URL
const url = "https://mmp-m65f7pel8-daphne-gos-projects.vercel.app/";

// Admin Student Enrollment Email
export const adminStudentEnrollmentEmail = (studentName, studentEmail, studentId) => {
    return {
        to: adminEmail,
        subject: `[MMP ECE] New Student Enrollment`,
        html: 
            `A new enrollment has been submitted for approval.
            <br> 
            <br> <b>Student Details:</b>
            <br> Student Name: ${studentName}
            <br> Student Email: <a href="${studentEmail}">${studentEmail}</a>
            <br> Student ID (auto-generated): ${studentId}
            <br> 
            <br> Please proceed to the <a href="${url}">website</a> to update the status.
            <br> 
            <br> Regards,
            <br> MMP ECE Program Web Service
            <br> `,
    };
}

// Student Accepted Enrollment Email
export const studentAcceptedEnrollmentEmail = (studentName, studentEmail, studentId) => {
    return {
        to: studentEmail,
        subject: `[MMP ECE] New Student Enrollment`,
        html: 
            `Your student enrollment in the MMP ECE Program has been verified. Your Student ID below will serve as your login credentials for the website.
            <br> 
            <br> <b>Student Details:</b>
            <br> Student Name: ${studentName}
            <br> Student ID (auto-generated): <b>${studentId}</b>
            <br> 
            <br> You may now log on to the <a href="${url}">website</a> and access your student profile. This is where you will be able to enroll in additional modules and request for your student transcript.
            <br> 
            <br> For concerns, please contact the MMP ECE Program Administrator through: <a href="${adminEmail}">${adminEmail}</a>
            <br> 
            <br> Regards,
            <br> MMP ECE Program Web Service
            <br> `,
    };
}

// Student Rejected Enrollment Email
export const studentRejectedEnrollmentEmail = (studentEmail) => {
    return {
        to: studentEmail,
        subject: `[MMP ECE] Enrollment Unsuccessful`,
        html: 
            `Your student enrollment in the MMP ECE Program was rejected.
            <br> 
            <br> Please contact the MMP ECE Program Administrator through <a href="${adminEmail}">${adminEmail}</a> if you think there has been a mistake.
            <br> 
            <br> Regards,
            <br> MMP ECE Program Web Service
            <br> `,
    };
}

// Admin Faculty Signup Email
export const adminFacultySignupEmail = (facultyName, facultyEmail, facultyId) => {
    return {
        to: adminEmail,
        subject: `[MMP ECE] New Faculty Account Sign Up`,
        html: 
            `A new faculty account has been submitted for approval.
            <br> 
            <br> <b>Faculty Details:</b>
            <br> Faculty Name: ${facultyName}
            <br> Faculty Email: <a href="${facultyEmail}">${facultyEmail}</a>
            <br> Faculty ID (auto-generated): ${facultyId}
            <br> 
            <br> Please proceed to the <a href="${url}">website</a> to update the status.
            <br> 
            <br> Regards,
            <br> MMP ECE Program Web Service
            <br> `,
    };
}

// Faculty Accepted Signup Email
export const facultyAcceptedSignupEmail = (facultyName, facultyEmail, facultyId) => {
    return {
        to: facultyEmail,
        subject: `[MMP ECE] Faculty Account Verified`,
        html: 
            `Your faculty account in the MMP ECE Program has been verified. Your Faculty ID below will serve as your login credentials for the website.
            <br> 
            <br> <b>Faculty Details:</b>
            <br> Faculty Name: ${facultyName}
            <br> Faculty ID (auto-generated): <b>${facultyId}</b>
            <br> 
            <br> You may now log on to the <a href="${url}">website</a> and access your faculty profile. This is where you will be able to input and edit your student's grades.
            <br> 
            <br> For concerns, please contact the MMP ECE Program Administrator through: <a href="${adminEmail}">${adminEmail}</a>
            <br> 
            <br> Regards,
            <br> MMP ECE Program Web Service
            <br> `,
    };
}

// Faculty Rejected Signup Email
export const facultyRejectedSignupEmail = (facultyEmail) => {
    return {
        to: facultyEmail,
        subject: `[MMP ECE] Faculty Account Creation Unsuccessful`,
        html: 
            `Your faculty account creation in the MMP ECE Program was rejected.
            <br> 
            <br> Please contact the MMP ECE Program Administrator through <a href="${adminEmail}">${adminEmail}</a> if you think there has been a mistake.
            <br> 
            <br> Regards,
            <br> MMP ECE Program Web Service
            <br> `,
    };
}

// Admin TOR Request Email
export const adminTORRequestEmail = (studentName, studentEmail, studentId, requestDate) => {
    return {
        to: adminEmail,
        subject: `[MMP ECE] New Student Transcript Request`,
        html: 
            `A new transcript request has been made.
            <br> 
            <br> <b>Student Details:</b>
            <br> Student Name: ${studentName}
            <br> Student Email: <a href="${studentEmail}">${studentEmail}</a>
            <br> Student ID (auto-generated): ${studentId}
            <br> Date Requested: ${requestDate}
            <br> 
            <br> Please proceed to the <a href="${url}">website</a> to update the status.
            <br> 
            <br> Regards,
            <br> MMP ECE Program Web Service
            <br> `,
    };
}

// Admin Student Module Enrollment Email
export const adminStudentModuleEnrollmentEmail = (studentName, studentEmail, studentId, moduleName) => {
    return {
        to: adminEmail,
        subject: `[MMP ECE] New Module Enrollment`,
        html: 
            `A student has enrolled in a new module.
            <br> 
            <br> <b>Details:</b>
            <br> Student Name: ${studentName}
            <br> Student Email: <a href="${studentEmail}">${studentEmail}</a>
            <br> Student ID (auto-generated): ${studentId}
            <br> Module Name: ${moduleName}
            <br> 
            <br> Please proceed to the <a href="${url}">website</a> to update the status.
            <br> 
            <br> Regards,
            <br> MMP ECE Program Web Service
            <br> `,
    };
}