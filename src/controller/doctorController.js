const catchAsync = require('../utils/catchAsync');
const doctorService = require('../services/doctorService');

// Controller function to get all doctors
exports.getAllDoctors = catchAsync(async (req, res, next) => {
    const doctors = await doctorService.getAllDoctors();

    return res.status(200).json({
        status: 'success',
        message: 'Doctors retrieved successfully',
        data: doctors,
    });
});


// Controller function to add a doctor
exports.addDoctor = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const doctorData = { ...req.body, createdBy: userId };

    const newDoctor = await doctorService.addDoctor(doctorData);

    return res.status(201).json({
        status: 'success',
        message: 'Doctor added successfully',
        data: newDoctor,
    });
});


// Controller function to edit a doctor
exports.editDoctor = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { id } = req.params;
    const updatedData = { ...req.body, modifiedBy: userId, modifiedOn: new Date() };

    const updatedDoctor = await doctorService.editDoctor(id, updatedData);

    return res.status(200).json({
        status: 'success',
        message: 'Doctor updated successfully',
        data: updatedDoctor,
    });
});
