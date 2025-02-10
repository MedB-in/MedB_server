const { sequelize } = require('../config/postgresConnection');
const AppError = require('../utils/appError');
const Doctor = require('../models/sqlModels/doctorsModel');


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
    const { firstName, middleName, lastName, email, phone, profilePicture, speciality, qualifications, experience, gender, isActive, createdBy } = data;

    if (!firstName || !lastName || !email || !phone || !speciality || !experience || !gender) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for doctor' });
    }

    // Check if a doctor with the same email already exists, change the condition if needed
    const existingDoctor = await Doctor.findOne({ where: { email } });
    if (existingDoctor) {
        throw new AppError({ statusCode: 409, message: 'Doctor with this email already exists' });
    }

    return await Doctor.create({
        firstName,
        middleName,
        lastName,
        email,
        phone,
        profilePicture,
        speciality,
        experience,
        qualifications,
        gender,
        isActive,
        createdBy,
        createdOn: new Date(),
    });
};


// Service to edit a doctor
exports.editDoctor = async (doctorId, data) => {
    const doctor = await Doctor.findByPk(doctorId);

    if (!doctor) {
        throw new AppError({ statusCode: 404, message: 'Doctor not found' });
    }

    return await doctor.update(data);
};
