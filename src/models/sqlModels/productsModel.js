const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');
const Users = require('../sqlModels/userModel');

const Products = sequelize.define('Products', {
    productId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    values: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    isFree: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    isTrial: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(18, 3),
        allowNull: true,
    },
    taxAmount: {
        type: DataTypes.DECIMAL(18, 3),
        allowNull: true,
    },
    netAmount: {
        type: DataTypes.DECIMAL(18, 3),
        allowNull: true,
    },
    trialDays: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    createdOn: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    createdBy: {
        type: DataTypes.BIGINT,
        allowNull: true,
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
}, {
    timestamps: false,
    tableName: 'Products',
    indexes: [
        {
            unique: true,
            fields: ['productName'],
        },
    ],
});

Products.belongsTo(Users, { foreignKey: 'createdBy', as: 'creator' });
Products.belongsTo(Users, { foreignKey: 'modifiedBy', as: 'modifier' });

module.exports = Products;
