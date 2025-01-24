const catchAsync = require('../utils/catchAsync');
const subscriptionService = require('../services/subscriptionService');

// Controller function to add a subscription
exports.addSubscription = catchAsync(async (req, res, next) => {
    const { userId } = req.user; 
    const data = { ...req.body, createdBy: userId };

    const newSubscription = await subscriptionService.addSubscription(data);

    return res.status(201).json({
        status: 'success',
        message: 'Subscription added successfully',
        data: newSubscription,
    });
});
