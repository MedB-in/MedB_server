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
           <div style="font-family: Arial, sans-serif; width: 600px; margin: 40px auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;">
           <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Welcome to MedB!</h1>
           <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Hi ${firstName} ${middleName ? middleName : ""} ${lastName ? lastName : ""}!</p>
           <p style="color: #666; font-size: 16px; margin-bottom: 20px;">We're excited to have you on board!</p>
           <p style="color: #666; font-size: 16px; margin-bottom: 20px;">To verify your email address and access all the amazing features, please click the link below:</p>
           <p style="color: #666; font-size: 16px; margin-bottom: 20px;"><a href="${verificationUrl}" style="background-color: #4CAF50; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Verify Email</a></p>
           <p style="color: #666; font-size: 16px; margin-bottom: 20px;">If you didn't sign up for MedB, please ignore this email.</p>
           <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Stay healthy and fit with MedB!</p>
           <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Best regards,<br>The MedB Team</p>
           </div>
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

exports.sendPasswordResetEmail = async (email, resetCode) => {

    const mailOptions = {
        to: email,
        subject: "MedB - Password Reset Code",
        html: `
            <div style="font-family: Arial, sans-serif; width: 600px; margin: 40px auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">MedB Password Reset</h1>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Hi!</p>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">You have requested to reset your password for MedB.</p>
            <h2 style="color: #333; font-size: 18px; margin-bottom: 10px;">Your Reset Code:</h2>
            <p style="color: #666; font-size: 30px; margin-bottom: 20px;"><strong>${resetCode}</strong></p>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">If you did not request a password reset, please ignore this email.</p>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Best regards,</p>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">The MedB Team</p>
            </div>
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