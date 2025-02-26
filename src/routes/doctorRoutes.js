const { Router } = require('express');
const doctorController = require('../controller/doctorController');
const router = Router();

// Routes for doctors
router
    .route('/')
    .get(doctorController.getAllDoctors)
    .post(doctorController.addDoctor);

router
    .route('/list/:clinicId/:page')
    .get(doctorController.getActiveDoctors);

router
    .route('/slots/:clinicId/:doctorId/:date/:day')
    .get(doctorController.getSlots);

router
    .route('/slots')
    .post(doctorController.bookSlot);

router
    .route('/list')
    .get(doctorController.getDoctorsList);

router
    .route('/doctorClinic/:clinicId')
    .post(doctorController.addDoctorClinic);

router
    .route('/:id')
    .put(doctorController.editDoctor);

module.exports = router;