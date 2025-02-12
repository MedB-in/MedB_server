const { Router } = require('express');
const userController = require('../controller/doctorController');
const router = Router();

// Routes for doctors
router
    .route('/')
    .get(userController.getAllDoctors)
    .post(userController.addDoctor);

router
    .route('/list')
    .get(userController.getDoctorsList);

router
    .route('/doctorClinic/:clinicId')
    .post(userController.addDoctorClinic);

router
    .route('/:id')
    .put(userController.editDoctor);

module.exports = router;