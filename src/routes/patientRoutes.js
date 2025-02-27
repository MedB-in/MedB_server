const { Router } = require('express');
const router = Router();
const patientController = require('../controller/patientController');


// Routes for patients
router
    .route('/')
    .post(patientController.addPatient)

router
    .route('/appointment/:page')
    .get(patientController.getPatientAppointments)

module.exports = router;