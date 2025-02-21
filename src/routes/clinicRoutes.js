const { Router } = require('express');
const clinicController = require('../controller/clinicController');
const router = Router();

// Routes for clinics
router
    .route('/')
    .get(clinicController.getAllClinics)
    .post(clinicController.addClinic)

router
    .route('/list')
    .get(clinicController.getClinicList)

router
    .route('/active/:page')
    .get(clinicController.getActiveClinics)

router
    .route('/doctorClinic/:clinicId/:doctorId')
    .get(clinicController.getDoctorClinic)

router
    .route('/doctorClinic/:clinicId/:doctorId')
    .put(clinicController.editDoctorClinicStatus)

router
    .route('/slots/:clinicId/:doctorId')
    .get(clinicController.getSlots)

router
    .route('/slots')
    .post(clinicController.addSlots)

router
    .route('/slots/:slotId')
    .put(clinicController.editSlots)

router
    .route('/:id')
    .get(clinicController.getClinicDetails)
    .put(clinicController.editClinic)

module.exports = router;