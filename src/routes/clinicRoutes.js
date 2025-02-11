const { Router } = require('express');
const clinicController = require('../controller/clinicController');
const router = Router();

// Routes for clinics
router
    .route('/')
    .get(clinicController.getAllClinics)
    .post(clinicController.addClinic);

router
    .route('/:id')
    .get(clinicController.getClinicDetails)
    .put(clinicController.editClinic);

module.exports = router;