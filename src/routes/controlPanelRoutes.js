const { Router } = require('express');
const controlPanelController = require('../controller/authController');

const router = Router();

router
    .route('/menu')
    // .get(controlPanelController.getMenu)
    // .post(controlPanelController.addMenu);

router
    .route('/module')
    // .get(controlPanelController.getModule)
    // .post(controlPanelController.addModule);

module.exports = router;
