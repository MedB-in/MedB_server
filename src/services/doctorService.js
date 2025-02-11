const { sequelize } = require('../config/postgresConnection');
const { ValidationError } = require('sequelize');
const AppError = require('../utils/appError');
const Doctor = require('../models/sqlModels/doctorsModel');
const { add } = require('winston');
const { addColors } = require('winston/lib/winston/config');


// Service to get all doctors
exports.getAllDoctors = async () => {
    const doctors = await Doctor.findAll();

    if (!doctors) {
        throw new AppError({ statusCode: 404, message: 'No doctors found' });
    }

    return doctors.map(doctors => doctors.dataValues)
};


// Service to add a doctor
exports.addDoctor = async (data) => {
    const { firstName, middleName, lastName, registration, email, phone, profilePicture, speciality, qualifications, experience, gender, address, city, district, state, country, postalCode, isActive, createdBy } = data;

    if (!firstName || !lastName || !registration || !email || !phone || !speciality || !experience || !gender) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for doctor' });
    }

    // Check if a doctor with the same registration already exists, change the condition if needed
    const existingDoctor = await Doctor.findOne({ where: { registration } });
    if (existingDoctor) {
        throw new AppError({ statusCode: 409, message: 'Doctor with same registration already exists' });
    }

    return await Doctor.create({
        firstName,
        middleName,
        lastName,
        registration,
        email,
        phone,
        profilePicture,
        speciality,
        experience,
        qualifications,
        gender,
        address,
        city,
        district,
        state,
        country,
        postalCode,
        isActive,
        createdBy,
        createdOn: new Date(),
    });
};


// Service to edit a doctor
exports.editDoctor = async (doctorId, data) => {
    try {
        const doctor = await Doctor.findByPk(doctorId);

        if (!doctor) {
            throw new AppError({ statusCode: 404, message: 'Doctor not found' });
        }

        return await doctor.update(data);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new AppError({
                statusCode: 400,
                message: error.errors[0]?.message || 'Duplicate value error'
            });
        }
        if (error instanceof ValidationError) {
            throw new AppError({
                statusCode: 400,
                message: error.message
            });
        }
        throw error;
    }
};

