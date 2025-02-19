const { Router } = require('express');
const userController = require('../controller/userController');
const router = Router();

router
    .route('/updateProfile')
    .put(userController.updateProfile);






//routes for user rights
// router.post('/addUserRights', userController.addUserRights);
// router.post('/editUserRights', userController.editUserRights);


module.exports = router;