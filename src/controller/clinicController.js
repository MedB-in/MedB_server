const catchAsync = require("../util/catchAsync");
const clinicServices = require("../services/clinicServices");
const AppError = require("../util/appError");

// Controller to add a Clinic
exports.addClinic = catchAsync(async (req, res, next) => {
    const {
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
    const { clinicId } = req.params;
    const {
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
        isActive
    } = req.body;

    const modifiedBy = req.user.userId;

    if (!clinicId) {
        throw new AppError({ statusCode: 400, message: 'Clinic ID is required' });
    }

    const result = await clinicServices.editClinicService(clinicId, {
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
        modifiedBy
    });

    return res.status(result.statusCode).json({
        status: result.status,
        message: result.message,
        data: result.data,
    });
});