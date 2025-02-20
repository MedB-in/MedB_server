const catchAsync = require('../utils/catchAsync');
const patientServices = require('../services/patientServices');

// Controller to get appointments for a patient
exports.getPatientAppointments = catchAsync(async (req, res, next) => {
    const { page } = req.params
    const { search } = req.query;
    const { userId } = req.user;
    const appointments = await patientServices.getPatientAppointmentsService(userId, page, search);
    return res.status(200).json({ appointments });
});