const { sequelize } = require('../config/postgresConnection');
const AppError = require("../utils/appError");
const Clinic = require('../models/sqlModels/clinicsModel');
const DoctorSlot = require('../models/sqlModels/doctorSlot');

// Service function to get all Clinics
exports.getAllClinicsService = async () => {
    const clinics = await Clinic.findAll();
    if (!clinics) {
        throw new AppError({ statusCode: 404, message: 'No clinics found' });
    }

    return clinics.map(clinic => clinic.dataValues);
};

// Service function to get Clinic List
exports.getClinicListService = async () => {
    const clinics = await Clinic.findAll({
        attributes: ['clinicId', 'name'],
    });

    if (!clinics || clinics.length === 0) {
        throw new AppError({ statusCode: 404, message: 'No clinics found' });
    }

    return clinics.map(clinic => clinic.dataValues);
};

//Service function to get a single Doctor details and corresponding Clinic details
exports.getDoctorWithClinic = async (clinicId, doctorId) => {

    try {
        const query = `SELECT getClinicDetailsWithDoctorDetails(:clinicId, :doctorId);`;

        const [data] = await sequelize.query(query, {
            replacements: { clinicId, doctorId },
            type: sequelize.QueryTypes.SELECT,
        });

        return data.getclinicdetailswithdoctordetails;
    } catch (error) {
        throw new AppError({ statusCode: 500, message: "Error fetching clinic data", error });
    }
};

//Service function to get slots of a doctor
exports.getSlots = async (clinicId, doctorId) => {
    try {
        const query = `SELECT getDoctorSlot(:clinicId, :doctorId)`;

        const [data] = await sequelize.query(query, {
            replacements: { clinicId, doctorId },
            type: sequelize.QueryTypes.SELECT,
        });

        return data.getdoctorslot;
    } catch (error) {
        throw new AppError({ statusCode: 500, message: "Error fetching slot data", error });
    }
};

//Service function to add slots for a Doctor in a clinic
exports.addSlots = async (createdBy, slotData) => {
    const { clinicId, doctorId, day, timingFrom, timingTo, slotGap } = slotData;

    try {
        const result = await sequelize.query(
            `SELECT AddDoctorSlot(:clinicId, :doctorId, :day, :timingFrom, :timingTo, :slotGap, :createdBy) AS response`,
            {
                replacements: { clinicId, doctorId, day, timingFrom, timingTo, slotGap, createdBy },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!result || result.length === 0 || !result[0].response) {
            throw new AppError({ statusCode: 500, message: "No response from database function." });
        }
        let response = result[0].response;
        if (typeof response === "string") {
            try {
                response = JSON.parse(response);
            } catch (parseError) {
                throw new AppError({ statusCode: 500, message: "Invalid JSON response from database.", error: parseError });
            }
        }
        if (response.status === "error") {
            return {
                status: "error",
                message: response.message,
                overlappingSlots: response.overlapping_slots || [],
            };
        }
        return response;
    } catch (error) {
        throw new AppError({ statusCode: 500, message: "Error adding slots", error });
    }
};


exports.editSlots = async (slotId, modifiedBy, slotData) => {
    const { clinicId, doctorId, day, timingFrom, timingTo, slotGap } = slotData;

    try {
        const result = await sequelize.query(
            `SELECT EditDoctorSlot(:clinicId, :doctorId, :slotId, :day, :timingFrom, :timingTo, :slotGap, :modifiedBy) AS response`,
            {
                replacements: { clinicId, doctorId, slotId, day, timingFrom, timingTo, slotGap, modifiedBy },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!result || result.length === 0 || !result[0].response) {
            throw new AppError({ statusCode: 500, message: "No response from database function." });
        }

        let response = result[0].response;

        if (typeof response === "string") {
            try {
                response = JSON.parse(response);
            } catch (parseError) {
                throw new AppError({ statusCode: 500, message: "Invalid JSON response from database.", error: parseError });
            }
        }

        if (response.status === "error") {
            return {
                status: "error",
                message: response.message,
                overlappingSlots: response.overlapping_slots || [],
            };
        }

        return response;
    } catch (error) {
        throw new AppError({ statusCode: 500, message: "Error editing slots", error });
    }
};



// Service function to add a Clinic
exports.addClinicService = async ({
    name,
    location,
    address,
    city,
    district,
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
        where: { email },
    });

    if (existingClinic) {
        throw new AppError({ statusCode: 400, message: 'Clinic with this email already exists' }); //need to change this to handle multiple clinics with same name 
    }

    const clinic = await Clinic.create({
        name,
        location,
        address,
        district,
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


//Service function to get a single Clinic details with doctors
exports.getClinicWithDoctors = async (clinicId) => {
    try {
        const query = `SELECT * FROM getClinicDetails(:id);`;

        const [data] = await sequelize.query(query, {
            replacements: { id: clinicId },
            type: sequelize.QueryTypes.SELECT,
        });
        return data.getclinicdetails;
    } catch (error) {
        throw new AppError({ statusCode: 500, message: "Error fetching clinic data", error });
    }
};