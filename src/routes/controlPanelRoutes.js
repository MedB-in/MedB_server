const { Router } = require('express');
const controlPanelController = require('../controller/controlPanelController');

const router = Router();

router
    .route('/menu')
    .get(controlPanelController.getAllMenus)
    .post(controlPanelController.addMenu)

router
    .route('/menu/:id')
    .put(controlPanelController.editMenu)

router
    .route('/module')
    .post(controlPanelController.addModule);

router
    .route('/module/:id')
    .put(controlPanelController.editModule)

module.exports = router;
