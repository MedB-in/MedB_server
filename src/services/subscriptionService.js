const { sequelize } = require('../config/postgresConnection');
const Subscription = require('../models/sqlModels/subscriptionModel');
const User = require('../models/sqlModels/userModel');
const Products = require('../models/sqlModels/productsModel');
const AppError = require('../utils/appError');


// Service to get all subscriptions with optional search
exports.getAllSubscriptionsService = async (page, searchQuery = '') => {
    try {
        const itemsPerPage = 20;

        const result = await sequelize.query(
            `SELECT get_all_subscriptions(:page, :itemsPerPage, :searchQuery)`,
            {
                replacements: { page, itemsPerPage, searchQuery },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (!result || result.length === 0 || !result[0].get_all_subscriptions) {
            throw new AppError({ statusCode: 404, message: 'No subscriptions found' });
        }

        const { subscriptions, totalPages, totalItemsPerPage, currentPage } = result[0].get_all_subscriptions;
        return { subscriptions, totalPages, totalItemsPerPage, currentPage };
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        throw new AppError({ statusCode: 500, message: 'Error retrieving subscriptions' });
    }
};




// Service to add a subscription
// exports.addSubscription = async (data) => {
//     const { userId, productId, startOn, endOn, isPaid, days, period, netAmount, orderId } = data;
//     const createdBy = req.user.userId;
//     if (!userId || !productId || !startOn || !endOn || isPaid === undefined || !createdBy) {
//         throw new AppError({ statusCode: 400, message: 'Missing required fields for subscription creation' });
//     }

//     const userExists = await User.findByPk(userId);
//     if (!userExists) {
//         throw new AppError({ statusCode: 404, message: 'User not found' });
//     }

//     const productExists = await Products.findByPk(productId);
//     if (!productExists) {
//         throw new AppError({ statusCode: 404, message: 'Product not found' });
//     }

//     // Dummy subscription creation for now
//     // the subscription's time and date would depend on the actual payment process
//     // the 'days', 'netAmount', 'period', and other data would depend on the product chosen by the user

//     const subscription = await Subscription.create({
//         userId,
//         productId,
//         startOn,
//         endOn,
//         isPaid,
//         days,
//         period,
//         netAmount,
//         createdOn: new Date(),
//         createdBy,
//         modifiedOn: null,
//         modifiedBy: null,
//         orderId,
//     });

//     return subscription;
// };
