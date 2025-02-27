const bcrypt = require("bcrypt");
const { sequelize } = require("../config/postgresConnection");
const AppError = require("../utils/appError");
const User = require("../models/sqlModels/userModel");
const UserSubscription = require("../models/sqlModels/subscriptionModel");
const Clinic = require("../models/sqlModels/clinicsModel");
const { sendVerificationEmailFromClinic } = require("./emailServices");

const generateRandomPassword = (length = 10) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map(x => chars[x % chars.length])
        .join("");
};

//Service to get appointments for a patient
exports.getPatientAppointmentsService = async (userId, page, search = '') => {
    try {
        const limit = 10;
        const result = await sequelize.query(
            `SELECT get_patient_appointments(:userId, :page, :limit, :search) AS appointments`,
            {
                replacements: { userId, page, limit, search },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        const appointments = result.length > 0 ? result[0].appointments : [];
        return appointments;
    } catch (error) {
        throw new AppError(error.message || "Failed to fetch patient appointments", 500);
    }
};


// Service to add a patient from clinic
exports.addPatientService = async (data, createdBy) => {
    const existingUser = await User.findOne({
        where: { email: data.email },
        attributes: ["userId"]
    });

    if (existingUser) {
        throw new AppError({ statusCode: 409, message: "Email already registered" });
    }

    const clinic = await Clinic.findOne({
        where: { clinicId: data.clinicId },
        attributes: ["clinicId", "name"]
    });

    if (!clinic) {
        throw new AppError({ statusCode: 404, message: "Clinic not found" });
    }

    const randomPassword = generateRandomPassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);
    const transaction = await sequelize.transaction();

    try {
        const user = await User.create({
            firstName: data.firstName,
            middleName: data.middleName || null,
            lastName: data.lastName || null,
            email: data.email,
            contactNo: data.contactNo,
            password: hashedPassword,
            isActive: false,
            isVerified: false,
            lastLoginOn: new Date(),
            createdOn: new Date(),
            createdBy: createdBy,
        }, { transaction });

        await UserSubscription.create({
            userId: user.userId,
            productId: 2, // patient
            startOn: new Date(),
            endOn: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // One-year validity
            isPaid: false,
            createdBy: createdBy,
            createdOn: new Date(),
        }, { transaction });

        
        try {
            await sendVerificationEmailFromClinic(
                data.firstName,
                data.middleName,
                data.lastName,
                user.userId,
                data.email,
                user.loginKey,
                clinic.name,
                randomPassword
            );
        } catch (emailError) {
            await transaction.rollback();
            console.error("Email sending failed, but transaction is already committed:", emailError);
        }
        
        await transaction.commit();
        return {
            userId: user.userId,
            email: user.email,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            contactNo: user.contactNo
        };

    } catch (error) {
        await transaction.rollback();
        throw new AppError(error.message || "Failed to add patient", 500);
    }
};

