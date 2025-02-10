const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');
const Users = require('../sqlModels/userModel');

const Doctor = sequelize.define('Doctor', {
    doctorId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    middleName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    experience: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other'),
        allowNull: false,
    },
    speciality: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    signature: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: DataTypes.GEOGRAPHY('Point', 4326), // Geo-location
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    postalCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    createdOn: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    modifiedOn: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Users,
            key: 'userId',
        },
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
    tableName: 'Doctors',
});

Doctor.belongsTo(Users, { foreignKey: 'createdBy', as: 'createdByUser' });
Doctor.belongsTo(Users, { foreignKey: 'modifiedBy', as: 'modifiedByUser' });

module.exports = Doctor;
