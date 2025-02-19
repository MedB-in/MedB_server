const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');

const User = sequelize.define('User', {

    userId: {
        type: DataTypes.BIGINT, // Using BIGINT instead of UUID
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
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
        allowNull: true,
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
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    district: {
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
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    isVerified: {
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
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'Users',
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
            model: 'Users',
            key: 'userId',
        },
    },
    loginKey: {
        type: DataTypes.UUID,  // UUID type instead of STRING
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
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

User.hasMany(User, { foreignKey: 'createdBy', as: 'createdByUser' });
User.hasMany(User, { foreignKey: 'modifiedBy', as: 'modifiedByUser' });

module.exports = User;
