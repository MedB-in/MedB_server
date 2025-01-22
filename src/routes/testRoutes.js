const { Router } = require('express');
const testController = require('../controller/testController');
const authController = require('../controller/authController');
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

module.exports = router;
