const { Router } = require('express');
const testController = require('../controller/testController');
// const authController = require('../controller/authController');
const clinicController = require('../controller/clinicController');
const doctorController = require('../controller/doctorController');
const router = Router();

// POST route for error testing
router.get('/error', (req, res, next) => {
    const error = new Error("Test error logging");
    error.statusCode = 500;
    next(error);
});

router.post('/register', testController.register);
router.get('/login', testController.login);
// router.get('/login', authController.login);

//test routes for user rights
router.post('/addUserRights', testController.addUserRights);
router.post('/editUserRights', testController.editUserRights);

//test routes for products
router.post('/addProduct', testController.addProduct);
router.post('/editProduct', testController.editProduct);
router.post('/addProductMenu', testController.addProductMenu);
router.post('/editProductMenu', testController.editProductMenu);

//test routes for modules
router.post('/addModule', testController.addModule);
router.post('/editModule', testController.editModule);

//test routes for menu
router.post('/addMenu', testController.addMenu);
router.post('/editMenu', testController.editMenu);

//test routes for subscription
router.post('/addSubscription', testController.addSubscription);

// router.post('/clinic/addClinic', clinicController.addClinic);
// router.post('/clinic/editClinic/:clinicId', clinicController.editClinic);

//test routes for doctors
// router.post('/addDoctor', doctorController.addDoctor);
// router.post('/editDoctor/:doctorId', doctorController.editDoctor);


module.exports = router;