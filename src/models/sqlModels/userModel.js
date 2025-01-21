const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');

const User = sequelize.define('User', {

    userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
    },

    name: {
        type: DataTypes.STRING, // nvarchar
        allowNull: false,
    },

    password: {
        type: DataTypes.STRING, // nvarchar (to store password hash)
        allowNull: true,
    },

    designation: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    signature: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    email: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
        unique: true, // Ensure unique email
    },

    contactNo: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    address1: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    address2: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    nationality: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    firstName: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    lastName: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    pin: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    profilePicture: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    isActive: {
        type: DataTypes.BOOLEAN, // bit
        allowNull: false,
    },

    createdOn: {
        type: DataTypes.DATE, // datetime
        allowNull: false,
        defaultValue: DataTypes.NOW, // Set the current timestamp when a record is created
    },

    lastLoginOn: {
        type: DataTypes.DATE, // datetime
        allowNull: false,
    },

    createdBy: {
        type: DataTypes.INTEGER, // int
        allowNull: false,
    },

    modifiedOn: {
        type: DataTypes.DATE, // datetime
        allowNull: true,
    },

    modifiedBy: {
        type: DataTypes.INTEGER, // int
        allowNull: true,
    },

    loginKey: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    salt: {
        type: DataTypes.STRING, // nvarchar
        allowNull: true,
    },

    redirection: {
        type: DataTypes.INTEGER, // int
        allowNull: true,
    },
}, {
    timestamps: false,
    tableName: 'Users',
});

module.exports = User;
