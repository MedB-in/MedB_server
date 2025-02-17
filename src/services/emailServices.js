const nodemailer = require("nodemailer");
const env = require("../utils/validateEnv");
const AppError = require("../utils/appError");

const url = env.NODE_ENV === 'dev'
    ? env.DEV_URL
    : env.NODE_ENV === 'test'
        ? env.TEST_URL
        : env.PRODUCTION_URL;


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: env.EMAIL,
        pass: env.EMAILPASS
    },
});


// Service Function to send email verification link
exports.sendVerificationEmail = async (firstName, middleName, lastName, userId, email, loginKey) => {
    const verificationUrl = `${url}/verify-email?token=${loginKey}&userId=${userId}`;

    const mailOptions = {
        to: email,
        subject: "MedB - Email Verification",
        html: `
            <p>Hi ${firstName} ${middleName} ${lastName}!</p>
            <p>Welcome to MedB! 🎉</p>
            <p>To start your health journey and access all the amazing features, please verify your email address by clicking the link below:</p>
            <p><a href="${verificationUrl}">🔗 Verify Email</a></p>
            <p>If you didn't sign up for MedB, please ignore this email.</p>
            <p>Stay healthy and fit with MedB!</p>
            <p>Best regards,<br>The MedB Team</p>
        `,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                reject(new AppError({ statusCode: 500, message: "Error sending email", error }));
            } else {
                console.log("Email sent:", info.response);
                resolve(info.response);
            }
        });
    });
};
