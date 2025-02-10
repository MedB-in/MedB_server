const { sequelize } = require('../config/postgresConnection');
const AppError = require("../util/appError");
const Clinic = require('../models/sqlModels/clinicsModel');

// Service function to get all Clinics
exports.getAllClinicsService = async () => {
    const clinics = await Clinic.findAll();
    if (!clinics) {
        throw new AppError({ statusCode: 404, message: 'No clinics found' });
    }

    return clinics.map(clinic => clinic.dataValues);
};


// Service function to add a Clinic
exports.addClinicService = async ({
    name,
    location,
    address,
    city,
    state,
    country,
    postalCode,
    contact,
    email,
    website,
    clinicPicture,
    openingHours,
    isActive,
    createdBy
}) => {

    const existingClinic = await Clinic.findOne({
        where: { name },
    });

    if (existingClinic) {
        throw new AppError({ statusCode: 400, message: 'Clinic with this name already exists' }); //need to change this to handle multiple clinics with same name 
    }

    const clinic = await Clinic.create({
        name,
        location,
        address,
        city,
        state,
        country,
        postalCode,
        contact,
        email,
        website,
        clinicPicture,
        openingHours,
        isActive,
        createdBy,
        createdOn: new Date(),
    });

    return {
        statusCode: 201,
        status: 'success',
        message: 'Clinic added successfully',
        data: clinic
    };
};


// Service function to edit a Clinic
exports.editClinicService = async (clinicId, updatedData) => {
    
    const clinic = await Clinic.findByPk(clinicId);

    if (!clinic) {
        throw new AppError({ statusCode: 404, message: 'Clinic not found' });
    }

    // Update clinic details
    await clinic.update({
        ...updatedData,
        modifiedBy: updatedData.modifiedBy,
        modifiedOn: new Date(),
    });

    return {
        statusCode: 200,
        status: 'success',
        message: 'Clinic updated successfully',
        data: clinic,
    };
};
