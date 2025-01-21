const { Router } = require('express');
const testController = require('../controller/testController');
const router = Router();

// POST route for error testing
router.get('/error', (req, res, next) => {
    const error = new Error("Test error logging");
    error.statusCode = 500;
    next(error);
});

router.post('/register', testController.register);
router.get('/login', testController.login);
router.post('/userRights', testController.addUserRights);

module.exports = router;
