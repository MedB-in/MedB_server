const { Router } = require('express');
const subscriptionController = require('../controller/subscriptionController');
const router = Router();

//routes for subscription
router.post('/addSubscription', subscriptionController.addSubscription);