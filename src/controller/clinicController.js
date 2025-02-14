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