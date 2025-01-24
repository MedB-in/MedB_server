const { Router } = require('express');
const userController = require('../controller/userController');
const router = Router();

//routes for user rights
router.post('/addUserRights', userController.addUserRights);
router.post('/editUserRights', userController.editUserRights);