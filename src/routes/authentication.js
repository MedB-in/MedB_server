const { Router } = require('express');
const authController = require('../controller/authController');

const router = Router();

router
    .route('/login')
    .post(authController.login);

router
    .route('/logout')
    .post(authController.logout);

router
    .route('/refreshAccessToken')
    .post(authController.refreshAccessToken);

    
module.exports = router;
