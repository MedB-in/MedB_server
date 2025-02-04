const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userService');

// Controller to add user rights
exports.addUserRights = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const data = { ...req.body, createdBy: userId };

    const userRights = await userService.addUserRights(data);

    return res.status(201).json({
        status: 'success',
        message: 'User rights added successfully',
        data: userRights,
    });
});

// Controller to edit user rights
exports.editUserRights = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const data = { ...req.body, modifiedBy: userId };

    await userService.editUserRights(data);

    return res.status(200).json({
        status: 'success',
        message: 'User rights updated successfully',
    });
});
