const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');

const User = sequelize.define('User', {

    userId: {
        type: DataTypes.BIGINT, // Using BIGINT instead of UUID
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    designation: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    signature: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },

    contactNo: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    address1: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    address2: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    nationality: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    pin: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },

    createdOn: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },

    lastLoginOn: {
        type: DataTypes.DATE,
        allowNull: false,
    },

    createdBy: {
        type: DataTypes.INTEGER, //edit with ref to user
        allowNull: false,
    },

    modifiedOn: {
        type: DataTypes.DATE,
        allowNull: true,
    },

    modifiedBy: {
        type: DataTypes.INTEGER, //edit with ref to user
        allowNull: true,
    },

    loginKey: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    salt: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    redirection: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    timestamps: false,
    tableName: 'Users',
});

module.exports = User;
