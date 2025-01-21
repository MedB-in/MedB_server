const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');
const User = require('../sqlModels/userModel');

const UserRights = sequelize.define('UserRights', {
    userRightsId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'userId', // Reference to userId in User model
        },
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    menuId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    viewAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    editAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    createAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    deleteAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    createdOn: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    modifiedOn: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    modifiedBy: {
        type: DataTypes.UUID,
        allowNull: true,
    },
}, {
    timestamps: false,
    tableName: 'UserRights',
});

module.exports = UserRights;
