const User = require('../models/sqlModels/userModel');
const UserRights = require('../models/sqlModels/userRightsModel');
const AppError = require('../utils/appError');
const deleteCloudinaryFile  = require('../utils/deleteCloudinaryFile');


//Service Function to update user profile
exports.updateUserProfile = async (data) => {
    const { userId } = data;
    const user = await User.findOne({ where: { userId } });
    if (!user) {
        throw new AppError({ statusCode: 404, message: 'User not found' });
    }
    await user.update(data);
    return user;
}

//Service Function to upload profile picture
exports.uploadProfilePicture = async (data) => {
    const { userId } = data;
    const user = await User.findOne({ where: { userId } });
    if (!user) {
        deleteCloudinaryFile(data.profilePicture)
        throw new AppError({ statusCode: 404, message: 'User not found' });
    }
    if(user.prifilePicture !== null && user.profilePicture){
    deleteCloudinaryFile(user.profilePicture)
    }
    await user.update(data);
    return user.profilePicture;
}

// // Service to add user rights
// exports.addUserRights = async (data) => {
//     const { userId, companyId, menuId, viewAllowed, editAllowed, createAllowed, deleteAllowed } = data;
//     const createdBy = req.user.userId;

//     if (!userId || !companyId || !menuId ||
//         viewAllowed === undefined || editAllowed === undefined ||
//         createAllowed === undefined || deleteAllowed === undefined) {
//         throw new AppError({ statusCode: 400, message: 'Missing required fields for user rights' });
//     }

//     // Check if the user rights already exist
//     const existingUserRights = await UserRights.findOne({
//         where: { userId, companyId },
//     });

//     if (existingUserRights) {
//         throw new AppError({ statusCode: 400, message: 'User rights already exist for this user' });
//     }

//     const userRights = await UserRights.create({
//         userId,
//         companyId,
//         menuId,
//         viewAllowed,
//         editAllowed,
//         createAllowed,
//         deleteAllowed,
//         createdBy,
//         createdOn: new Date(),
//     });

//     return userRights;
// };

// // Service to edit user rights
// exports.editUserRights = async (data) => {
//     const { userId, companyId, menuId, viewAllowed, editAllowed, createAllowed, deleteAllowed } = data;
//     const modifiedBy = req.user.userId;
    
//     if (!userId || !companyId || !menuId ||
//         viewAllowed === undefined || editAllowed === undefined ||
//         createAllowed === undefined || deleteAllowed === undefined) {
//         throw new AppError({ statusCode: 400, message: 'Missing required fields for user rights' });
//     }

//     // Check if the user rights exist
//     const existingUserRights = await UserRights.findOne({
//         where: { userId, companyId, menuId },
//     });

//     if (!existingUserRights) {
//         throw new AppError({ statusCode: 404, message: 'User rights not found for this user' });
//     }

//     await UserRights.update(
//         {
//             viewAllowed,
//             editAllowed,
//             createAllowed,
//             deleteAllowed,
//             modifiedBy,
//             modifiedOn: new Date(),
//         },
//         {
//             where: { userId, companyId, menuId },
//         }
//     );
// };
