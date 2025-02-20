const catchAsync = require('../utils/catchAsync');
const userService = require('../services/userServices');
const uploadMiddleware = require('../middleware/uploadMiddleware');


//Controller to update user profile
exports.updateProfile = catchAsync(async (req, res, next) => {

    const { userId } = req.user;
    const data = { ...req.body, userId, modifiedBy: userId }

    await userService.updateUserProfile(data);

    return res.status(200).json({
        status: 'success',
        message: 'User profile updated successfully',
    });
});

//Controller to upload profile picture
exports.uploadProfilePicture = catchAsync(async (req, res, next) => {

    const { userId } = req.user;
    const profilePicture = req.fileUrl
    const data = { profilePicture, userId, modifiedBy: userId, modifiedOn: new Date() }

    const user = await userService.uploadProfilePicture(data);

    return res.status(200).json({
        status: 'success',
        message: 'Profile picture updated',
        data: user,
    });
});

// // Controller to add user rights
// exports.addUserRights = catchAsync(async (req, res, next) => {
//     const { userId } = req.user;
//     const data = { ...req.body, createdBy: userId };

//     const userRights = await userService.addUserRights(data);

//     return res.status(201).json({
//         status: 'success',
//         message: 'User rights added successfully',
//         data: userRights,
//     });
// });

// // Controller to edit user rights
// exports.editUserRights = catchAsync(async (req, res, next) => {
//     const { userId } = req.user;
//     const data = { ...req.body, modifiedBy: userId };

//     await userService.editUserRights(data);

//     return res.status(200).json({
//         status: 'success',
//         message: 'User rights updated successfully',
//     });
// });
