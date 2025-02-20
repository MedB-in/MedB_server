const { Router } = require('express');
const userController = require('../controller/userController');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const router = Router();

router
    .route('/updateProfile')
    .put(userController.updateProfile);

router
    .route('/uploadProfilePicture')
    .post(uploadMiddleware, userController.uploadProfilePicture);




//routes for user rights
// router.post('/addUserRights', userController.addUserRights);
// router.post('/editUserRights', userController.editUserRights);


module.exports = router;