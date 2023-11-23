// Import Modules
import nodemailer from "nodemailer";
import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;

// Create Transporter Function
const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    });

    const accessToken = oauth2Client.getAccessToken();

    // const accessToken = await new Promise((resolve, reject) => {
    //     oauth2Client.getAccessToken((err, token) => {
    //         if (err) {
    //             reject();
    //         }
    //         resolve(token);
    //     });
    // });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL,
            accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    return transporter;
};

// Send Email Function
export const sendEmail = async (emailOptions) => {

    emailOptions.from = process.env.EMAIL;

    let emailTransporter = await createTransporter();
    emailTransporter.sendMail(emailOptions
        // , (err, info) => {   // For debugging purposes
        // if (err) {
        //     console.log(err);
        // }
        // else {
        //     console.log(info);
        // }
        // }
    );
};
