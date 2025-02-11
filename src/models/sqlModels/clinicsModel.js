const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');
const Users = require('../sqlModels/userModel');

const Clinic = sequelize.define('Clinic', {
    clinicId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.GEOGRAPHY('Point', 4326), // Geo-location (latitude, longitude)
        allowNull: false,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    postalCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    clinicPicture: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    openingHours: {
        type: DataTypes.JSONB, // Flexible opening hours
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
    tableName: 'Clinics',
});

Clinic.belongsTo(Users, { foreignKey: 'createdBy', as: 'createdByUser' });
Clinic.belongsTo(Users, { foreignKey: 'modifiedBy', as: 'modifiedByUser' });

module.exports = Clinic;
