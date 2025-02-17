const { Router } = require('express');
const authController = require('../controller/authController');

const router = Router();

router
    .route('/register')
    .post(authController.register);

router
    .route('/verifyEmail/:token/:userId')
    .get(authController.verifyEmail);

router
    .route('/login')
    .post(authController.login);

router
    .route('/logout')
    .post(authController.logout);

router
    .route('/refreshToken')
    .post(authController.refreshAccessToken);


module.exports = router;
