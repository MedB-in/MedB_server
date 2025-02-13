const { sequelize } = require('../config/postgresConnection');
const { ValidationError } = require('sequelize');
const AppError = require('../utils/appError');
const Doctor = require('../models/sqlModels/doctorsModel');
const DoctorClinic = require('../models/sqlModels/doctorClinicModel');

// Service to get all doctors with corresponding clinics
exports.getAllDoctors = async () => {
    const result = await sequelize.query(`SELECT getAllDoctors()`, {
        type: sequelize.QueryTypes.SELECT,
    });

    if (!result || result.length === 0 || !result[0].getalldoctors) {
        throw new AppError({ statusCode: 404, message: 'No doctors found' });
    }

    return result[0].getalldoctors;
};

//Service to get a list of doctors
exports.getDoctorsList = async () => {
    try {
        const doctors = await Doctor.findAll({
            attributes: ["doctorId", "firstName", "middleName", "lastName", "speciality", "qualifications"],
            where: { isActive: true }, // Fetching only active doctors
            order: [["firstName", "ASC"]],
        });

        return doctors.map(doctor => doctor.dataValues);
    } catch (error) {
        console.error("Error fetching doctor list:", error);
        throw new AppError({ statusCode: 500, message: "Error fetching doctor list", error });
    }
};



// Service to add a doctor to clinic from a list
exports.addDoctorClinic = async (data) => {
    const { doctorId, clinicId, joinedDate, status, isActive, createdBy } = data;

    try {
        const existingDoctorClinic = await DoctorClinic.findOne({
            where: { doctorId, clinicId },
        });

        if (existingDoctorClinic) {
            throw new AppError({
                statusCode: 400,
                message: "This doctor is already linked to the clinic.",
            });
        }

        const doctorClinic = await DoctorClinic.create({
            doctorId,
            clinicId,
            joinedDate: joinedDate || new Date(),
            status: status || "active",
            isActive,
            createdBy,
            createdOn: new Date(),
        });

        return { message: "Doctor added successfully", doctorClinic };
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new AppError({
                statusCode: 400,
                message: error.errors[0]?.message || "Duplicate value error",
            });
        }
        if (error instanceof ValidationError) {
            throw new AppError({
                statusCode: 400,
                message: error.message,
            });
        }
        throw error;
    }
};


// Service to add a doctor
exports.addDoctor = async (data) => {
    const {
        firstName, middleName, lastName, registration, email, phone, profilePicture,
        speciality, qualifications, experience, gender, address, city, district,
        state, country, postalCode, isActive, createdBy, clinicId, joinedDate, status
    } = data;

    if (!firstName || !lastName || !registration || !email || !phone || !speciality || !experience || !gender || !clinicId) {
        throw new AppError({ statusCode: 400, message: "Missing required fields for doctor" });
    }
    const transaction = await sequelize.transaction();
    try {
        const existingDoctor = await Doctor.findOne({ where: { registration }, transaction });
        if (existingDoctor) {
            throw new AppError({ statusCode: 409, message: "Doctor with the same registration already exists" });
        }
        const doctor = await Doctor.create({
            firstName, middleName, lastName, registration, email, phone, profilePicture,
            speciality, experience, qualifications, gender, address, city, district,
            state, country, postalCode, isActive, createdBy, createdOn: new Date()
        }, { transaction });

        await DoctorClinic.create({
            doctorId: doctor.doctorId,
            clinicId,
            joinedDate: joinedDate || new Date(),
            status: status || "active",
            isActive: false,
            createdBy,
            createdOn: new Date()
        }, { transaction });

        await transaction.commit();

        return { message: "Doctor added successfully", doctor };
    } catch (error) {
        await transaction.rollback();

        if (error.name === "SequelizeUniqueConstraintError") {
            throw new AppError({
                statusCode: 400,
                message: error.errors[0]?.message || "Duplicate value error",
            });
        }
        if (error instanceof ValidationError) {
            throw new AppError({
                statusCode: 400,
                message: error.message,
            });
        }
        throw error;
    }
};


// Service to edit a doctor
exports.editDoctor = async (doctorId, data) => {
    const clinicId = data.clinicId;
    const transaction = await sequelize.transaction();

    if (!data.firstName || !data.lastName || !data.registration || !data.email || !data.phone || !data.speciality || !data.experience || !data.gender || !clinicId) {
        throw new AppError({ statusCode: 400, message: "Missing required fields for doctor" });
    }
    
    try {
        const doctor = await Doctor.findByPk(doctorId, { transaction });
        if (!doctor) {
            throw new AppError({ statusCode: 404, message: "Doctor not found" });
        }
        await doctor.update(data, { transaction });
        let doctorClinic = await DoctorClinic.findOne({
            where: { doctorId },
            transaction,
        });
        if (doctorClinic) {
            await doctorClinic.update(
                {
                    clinicId: data.clinicId || doctorClinic.clinicId,
                    joinedDate: data.joinedDate || doctorClinic.joinedDate,
                    status: data.status || doctorClinic.status,
                    modifiedBy: data.modifiedBy,
                    modifiedOn: data.modifiedOn,
                    isActive: doctorClinic.isActive
                },
                { transaction }
            );
        } else {
            doctorClinic = await DoctorClinic.create(
                {
                    doctorId,
                    clinicId,
                    joinedDate: new Date(),
                    status: data.status || "active",
                    isActive: true,
                    createdBy: data.modifiedBy,
                    createdOn: data.modifiedOn
                },
                { transaction }
            );
        }
        await transaction.commit();
        return { message: "Doctor updated successfully" };
    } catch (error) {
        await transaction.rollback();
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new AppError({
                statusCode: 400,
                message: error.errors[0]?.message || "Duplicate value error",
            });
        }
        if (error instanceof ValidationError) {
            throw new AppError({
                statusCode: 400,
                message: error.message,
            });
        }
        throw error;
    }
};