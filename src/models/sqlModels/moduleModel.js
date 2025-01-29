const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');
const Users = require('../sqlModels/userModel');

const Module = sequelize.define('Module', {
    moduleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    moduleName: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    moduleIcon: {
        type: DataTypes.STRING, //changed
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
}, {
    timestamps: false,
    tableName: 'Module',
});

Module.belongsTo(Users, { foreignKey: 'createdBy', as: 'createdByUser' });
Module.belongsTo(Users, { foreignKey: 'modifiedBy', as: 'modifiedByUser' });

module.exports = Module;
