const catchAsync = require("../utils/catchAsync");
const clinicServices = require("../services/clinicServices");
const AppError = require("../utils/appError");

// Controller to get Clinics
exports.getAllClinics = catchAsync(async (req, res, next) => {
    const clinics = await clinicServices.getAllClinicsService();
    return res.status(200).json({ clinics });
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

    if (!name || !location || !address || !city || !state || !country || !postalCode || !contact || !createdBy) {
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

//Controller to get a single Clinic details with doctors
exports.getClinicDetails = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await clinicServices.getClinicWithDoctors(id);
    return res.status(200).json({ data });
})