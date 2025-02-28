const catchAsync = require('../utils/catchAsync');
const doctorService = require('../services/doctorService');

// Controller function to get all doctors with corresponding clinics
exports.getAllDoctors = catchAsync(async (req, res, next) => {
    const doctors = await doctorService.getAllDoctors();

    return res.status(200).json({
        status: 'success',
        message: 'Doctors retrieved successfully',
        data: doctors,
    });
});

// Controller function to get a list of doctors
exports.getDoctorsList = catchAsync(async (req, res, next) => {
    const doctors = await doctorService.getDoctorsList();

    return res.status(200).json({
        status: 'success',
        message: 'Doctors list retrieved successfully',
        data: doctors,
    })
});

// Controller function to get active doctors
exports.getActiveDoctors = catchAsync(async (req, res, next) => {
    const { clinicId, page } = req.params;
    const { searchQuery } = req.query;
    const { doctors, totalPages, itemsPerPage, currentPage } = await doctorService.getActiveDoctors(clinicId, page, searchQuery);
    return res.status(200).json({ doctors, totalPages, itemsPerPage, currentPage });
});

//COntroller function to get minimal details list of a clinic's doctors
exports.getClinicDoctorsList = catchAsync(async (req, res, next) => {
    const { clinicId } = req.params;
    const doctors = await doctorService.getClinicDoctorsList(clinicId);
    return res.status(200).json({ doctors });
}) 

// Controller function to add a doctor to clinic from a list
exports.addDoctorClinic = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { clinicId } = req.params;
    const data = { ...req.body, createdBy: userId, clinicId };

    const newDoctor = await doctorService.addDoctorClinic(data);

    return res.status(201).json({
        status: 'success',
        message: 'Doctor added successfully',
        data: newDoctor,
    });
})

//Controller function to get slots for booking
exports.getSlots = catchAsync(async (req, res, next) => {
    const { clinicId, doctorId, date, day } = req.params;
    const slots = await doctorService.getSlots(clinicId, doctorId, date, day);
    return res.status(200).json({ slots });
});

// Controller function to book a slot
exports.bookSlot = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { clinicId, doctorId, date, time, reason } = req.body;
    const data = { userId, clinicId, doctorId, date, time, reason, createdBy: userId };
    const newSlot = await doctorService.bookSlot(data);

    return res.status(201).json({
        status: 'success',
        message: 'Slot booked successfully',
        data: newSlot,
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
