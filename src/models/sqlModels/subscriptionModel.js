const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');
const Users = require('../sqlModels/userModel');
const Products = require('../sqlModels/productsModel');

const UserSubscription = sequelize.define('UserSubscription', {
    userSubscriptionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Users,
            key: 'userId',
        },
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Products,
            key: 'productId',
        },
    },
    startOn: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endOn: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    days: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    period: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    netAmount: {
        type: DataTypes.DECIMAL(18, 3),
        allowNull: true,
    },
    createdOn: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    createdBy: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Users,
            key: 'userId',
        },
    },
    modifiedOn: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    modifiedBy: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: Users,
            key: 'userId',
        },
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: false,
    tableName: 'UserSubscription',
});

UserSubscription.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
UserSubscription.belongsTo(Products, { foreignKey: 'productId', as: 'product' });
UserSubscription.belongsTo(Users, { foreignKey: 'createdBy', as: 'createdByUser' });
UserSubscription.belongsTo(Users, { foreignKey: 'modifiedBy', as: 'modifiedByUser' });

module.exports = UserSubscription;
