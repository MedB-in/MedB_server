const catchAsync = require("../utils/catchAsync");
const clinicServices = require("../services/clinicServices");
const AppError = require("../utils/appError");

// Controller to get Clinics
exports.getAllClinics = catchAsync(async (req, res, next) => {
    const clinics = await clinicServices.getAllClinicsService();
    return res.status(200).json({ clinics });
});


// Controller to get Clinic List
exports.getClinicList = catchAsync(async (req, res, next) => {
    const clinics = await clinicServices.getClinicListService();
    return res.status(200).json({ clinics });
});

//Controller to get active Clinics
exports.getActiveClinics = catchAsync(async (req, res, next) => {
    const { page } = req.params;
    const { searchQuery } = req.query;
    const { clinics, totalPages, itemsPerPage, currentPage } = await clinicServices.getActiveClinicsService(page, searchQuery);
    return res.status(200).json({ clinics, totalPages, itemsPerPage, currentPage });
});

//Controller to get a single Clinic details with doctors
exports.getClinicDetails = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await clinicServices.getClinicWithDoctors(id);
    return res.status(200).json({ data });
});


//Controller to get a single Doctor details and corresponding Clinic details
exports.getDoctorClinic = catchAsync(async (req, res, next) => {
    const { clinicId, doctorId } = req.params;
    const data = await clinicServices.getDoctorWithClinic(clinicId, doctorId);
    return res.status(200).json({ data });
});

//Controlle to set status of a Doctor in a clinic
exports.editDoctorClinicStatus = catchAsync(async (req, res, next) => {
    const { doctorId, clinicId } = req.params;
    const { isActive } = req.body;
    await clinicServices.editDoctorClinicStatus(doctorId, clinicId, isActive);
    return res.status(200).json({
        message: "Status updated successfully"
    });
});

//Controller to get slots for a Doctor in a clinic
exports.getSlots = catchAsync(async (req, res, next) => {
    const { clinicId, doctorId } = req.params;
    const data = await clinicServices.getSlots(clinicId, doctorId);
    return res.status(200).json({ data });

});

// Controller to add slots for a Doctor in a clinic 
exports.addSlots = catchAsync(async (req, res, next) => {
    const slotData = req.body;
    const createdBy = req.user.userId;

    const response = await clinicServices.addSlots(createdBy, slotData);

    if (response.status === "error") {
        return res.status(400).json({
            status: "error",
            message: response.message,
            overlappingSlots: response.overlappingSlots || [],
        });
    }

    return res.status(200).json({
        status: "success",
        message: response.message,
        doctorSlotId: response.doctorSlotId,
    });
});


//Controller to edit slots for a Doctor in a clinic
exports.editSlots = catchAsync(async (req, res, next) => {
    const { slotId } = req.params;

    const slotData = req.body;
    const modifiedBy = req.user.userId;

    const response = await clinicServices.editSlots(slotId, modifiedBy, slotData);

    if (response.status === "error") {
        return res.status(400).json({
            status: "error",
            message: response.message,
            overlappingSlots: response.overlappingSlots || [],
        });
    }

    return res.status(200).json({
        status: "success",
        message: response.message,
    });
});


// Controller to add a Clinic
exports.addClinic = catchAsync(async (req, res, next) => {
    const {
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
        isActive
    } = req.body;

    const createdBy = req.user.userId;

    if (!name || !location || !address || !district || !state || !country || !postalCode || !contact || !createdBy) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for clinic creation' });
    }

    const result = await clinicServices.addClinicService({
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
    });

    return res.status(result.statusCode).json({
        status: result.status,
        message: result.message,
        data: result.data,
    });
});


// Controller to edit a Clinic
exports.editClinic = catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const {
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
        isActive
    } = req.body;

    const modifiedBy = req.user.userId;

    if (!id) {
        throw new AppError({ statusCode: 400, message: 'Clinic ID is required' });
    }

    if (!name || !location || !address || !district || !state || !country || !postalCode || !contact || !modifiedBy) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for clinic creation' });
    }

    const result = await clinicServices.editClinicService(id, {
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
        modifiedBy
    });

    return res.status(result.statusCode).json({
        status: result.status,
        message: result.message,
        data: result.data,
    });
});


//Controller to add user to a Clinic
exports.addClinicUser = catchAsync(async (req, res, next) => {
    const { clinicId } = req.params;
    const { userId } = req.user;
    const data = req.body;
    if (!clinicId || clinicId === undefined) {
        throw new AppError({ statusCode: 400, message: 'Clinic ID is required' });
    }
    if (!data) {
        throw new AppError({ statusCode: 400, message: "User data not provided" });
    }
    if (!data.firstName || !data.email || !data.password) {
        throw new AppError({ statusCode: 400, message: "Missing required fields for user creation" });
    }
    const result = await clinicServices.addClinicUser(clinicId, data, userId);
    return res.status(result.statusCode).json({
        status: result.status,
        message: result.message,
        data: result.data
    });
});


//Controller to get users in a Clinic
exports.getClinicUsers = catchAsync(async (req, res, next) => {
    const { clinicId } = req.params;
    const data = await clinicServices.getClinicUsers(clinicId);
    return res.status(200).json({ data });
});


//Controler to get appointments for a Clinic
exports.getClinicAppointments = catchAsync(async (req, res, next) => {
    const { clinicId, page } = req.params;
    const { search, doctorId, startDate, endDate } = req.query;
    const appointments = await clinicServices.getClinicAppointments(clinicId, page, search, doctorId, startDate, endDate);
    return res.status(200).json({ appointments });
});


// Controller to get patient list for walk in appointment
exports.getPatientsList = catchAsync(async (req, res, next) => {
    const { search } = req.query;
    const patients = await clinicServices.getPatientList(search);
    return res.status(200).json({ patients });
});


//Controller to book an appointment appointment from a Clinic
exports.bookFromClinic = catchAsync(async (req, res, next) => {
    const data = req.body;
    const createdBy = req.user.userId;

    const newSlot = await clinicServices.bookAppointment(data, createdBy);
    return res.status(201).json({
        status: 'success',
        message: 'Slot booked successfully',
        data: newSlot
    });
});


//Controller to update the status of an appointment
exports.updateAppointmentStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    const modifiedBy = req.user.userId;

    const result = await clinicServices.updateAppointmentStatus(id, status, modifiedBy);

    return res.status(200).json({
        status: "success",
        message: "Appointment status updated successfully",
        data: result
    });
});
