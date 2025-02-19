const { Router } = require('express');
const subscriptionController = require('../controller/subscriptionController');
const router = Router();

//routes for subscription
router
    .route('/:page')
    .get(subscriptionController.getAllSubscriptions)

// router.post('/addSubscription', subscriptionController.addSubscription);

module.exports = router;
