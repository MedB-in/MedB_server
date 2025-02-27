const bcrypt = require("bcrypt");
const { sequelize } = require('../config/postgresConnection');
const AppError = require("../utils/appError");
const Clinic = require('../models/sqlModels/clinicsModel');
const DoctorClinic = require('../models/sqlModels/doctorClinicModel');
const ClinicUser = require('../models/sqlModels/clinicUser');
const User = require('../models/sqlModels/userModel');
const Appointments = require('../models/sqlModels/appointmentsModel');
const UserSubscription = require('../models/sqlModels/subscriptionModel');
const { sendVerificationEmail } = require('./emailServices');

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

//Service function to get active Clinics
exports.getActiveClinicsService = async (page, searchQuery = '') => {
    try {
        const limit = 10;

        const result = await sequelize.query(
            `SELECT get_all_active_clinics(:page, :limit, :searchQuery)`,
            {
                replacements: { page, limit, searchQuery },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!result || result.length === 0 || !result[0].get_all_active_clinics) {
            throw new AppError({ statusCode: 404, message: 'No clinics found' });
        }
        const { clinics, totalPages, itemsPerPage, currentPage } = result[0].get_all_active_clinics;
        return { clinics, totalPages, itemsPerPage, currentPage };
    } catch (error) {
        throw new AppError({ statusCode: 500, message: 'Error retrieving clinics' });
    }
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

//Service fundtion to edit the status of a doctor in a clinic
exports.editDoctorClinicStatus = async (doctorId, clinicId, isActive) => {
    try {
        const result = await DoctorClinic.update({ isActive }, { where: { doctorId, clinicId } });

        if (result[0] === 0) {
            throw new AppError({ statusCode: 404, message: "Doctor not found in clinic" });
        }
        return result;
    } catch (error) {
        throw new AppError({ statusCode: 500, message: "Error updating doctor status", error });
    }
}

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


//Service function to add a user in a Clinic
exports.addClinicUser = async (clinicId, data, createdBy) => {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
        throw new AppError({ statusCode: 409, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const transaction = await sequelize.transaction();
    try {
        const user = await User.create({
            firstName: data.firstName,
            middleName: data.middleName || null,
            lastName: data.lastName || null,
            email: data.email,
            password: hashedPassword,
            isActive: false,
            isVerified: false,
            lastLoginOn: new Date(),
            createdOn: new Date(),
            createdBy: createdBy,
        }, { transaction });

        await UserSubscription.create({
            userId: user.userId,
            productId: 4, // clinic
            startOn: new Date(),
            endOn: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // One-year validity for now
            isPaid: false,
            createdBy: createdBy,
            createdOn: new Date(),
        }, { transaction });

        const clinicUser = await ClinicUser.create({ clinicId, userId: user.userId, createdBy, createdOn: new Date() }, { transaction });
        try {
            await sendVerificationEmail(
                data.firstName,
                data.middleName,
                data.lastName,
                user.userId,
                data.email,
                user.loginKey
            );
        } catch (error) {
            await transaction.rollback();
            console.error("Failed to send verification email:", error);
        }

        await transaction.commit();
        const userCLinic = {
            userId: user.userId,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            contactNo: user.contactNo,
            isActive: user.isActive,
            isVerified: user.isVerified,
            clinicUserId: clinicUser.clinicUserId
        }
        return {
            statusCode: 201,
            status: "success",
            message: "User added to clinic successfully",
            data: userCLinic
        };

    } catch (error) {
        if (transaction) await transaction.rollback();
        throw new AppError({ statusCode: 500, message: "Failed to create user", error });
    }
};


//Service Function to get users in a Clinic
exports.getClinicUsers = async (clinicId) => {
    const clinicUsers = await ClinicUser.findAll({
        where: { clinicId },
        include: [
            {
                model: User,
                as: "user",
                attributes: ["userId", "firstName", "middleName", "lastName", "email", "contactNo", "isActive", "isVerified"],
            },
        ],
        raw: true,
    });

    const formattedUsers = clinicUsers.map((record) => ({
        clinicUserId: record.clinicUserId,
        clinicId: record.clinicId,
        createdOn: record.createdOn,
        modifiedOn: record.modifiedOn,
        createdBy: record.createdBy,
        modifiedBy: record.modifiedBy,
        userId: record["user.userId"],
        firstName: record["user.firstName"],
        middleName: record["user.middleName"],
        lastName: record["user.lastName"],
        email: record["user.email"],
        contactNo: record["user.contactNo"],
        isActive: record["user.isActive"],
        isVerified: record["user.isVerified"],
    }));
    return formattedUsers;
};


//Service Function to get appointments in a Clinic
exports.getClinicAppointments = async (clinicId, page, search = '') => {
    try {
        const limit = 10;
        const result = await sequelize.query(
            `SELECT get_clinic_appointments(:clinicId, :page, :limit, :search) AS appointments`,
            {
                replacements: { clinicId, page, limit, search },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        const appointments = result.length > 0 ? result[0].appointments : [];

        return appointments;
    } catch (error) {
        throw new AppError({ message: error.message || "Failed to fetch clinic appointments", statusCode: 500 });
    }
}


//Service Function to get patient details for walk in appointment
exports.getPatientList = async (search = '') => {
    try {
        const result = await sequelize.query(
            `SELECT get_patient_list(:search) AS patients`,
            {
                replacements: { search },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        const patients = result.length > 0 ? result[0].patients : [];
        return patients;
    } catch (error) {
        throw new AppError({ message: error.message || "Failed to fetch patient list", statusCode: 500 });
    }
}


//Service Function to book an appointment from a Clinic
exports.bookAppointment = async (data, createdBy) => {
    const {
        clinicId,
        patientId,
        doctorId,
        date,
        time,
        reason,
    } = data;

    try {
        // Check if the slot is already booked
        const existingAppointment = await Appointments.findOne({
            where: { doctorId, clinicId, appointmentDate: date, appointmentTime: time },
        });

        if (existingAppointment) {
            throw new AppError({
                statusCode: 400,
                message: "This slot is already booked.",
            });
        }

        const existingAppointmentByPatient = await Appointments.findOne({
            where: { doctorId, patientId, clinicId, appointmentDate: date, },
        });

        if (existingAppointmentByPatient) {
            throw new AppError({
                statusCode: 400,
                message: "Doctor already booked for the sameday.",
            });
        }

        const appointment = await Appointments.create({
            patientId,
            clinicId,
            doctorId,
            reasonForVisit: reason,
            appointmentDate: date,
            appointmentTime: time,
            createdBy,
            createdOn: new Date(),
        });


        return { message: "Slot booked successfully", appointment };

    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            throw new AppError({
                statusCode: 400,
                message: error.errors[0]?.message || "Duplicate value error",
            });
        }
        throw error;
    }
}