const { v2: cloudinary } = require('cloudinary');
const AppError = require("../utils/appError");

// Function to delete the image from Cloudinary
const deleteCloudinaryFile = async (fileUrl) => {
    try {
        const publicId = fileUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`medb/${publicId}`);
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        throw new AppError({ statusCode: 500, message: 'Failed to delete file from Cloudinary.' });
    }
};

module.exports = deleteCloudinaryFile;
