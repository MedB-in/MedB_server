const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');
const Users = require('../sqlModels/userModel');
const Module = require('../sqlModels/moduleModel');

const Menu = sequelize.define('Menu', {
    menuId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    moduleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Module,
            key: 'moduleId',
        },
    },
    menuName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    actionName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    controllerName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    menuIcon: {
        type: DataTypes.STRING,
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
    tableName: 'Menu',
});

Menu.belongsTo(Module, { foreignKey: 'moduleId', as: 'module' });
Menu.belongsTo(Users, { foreignKey: 'createdBy', as: 'createdByUser' });
Menu.belongsTo(Users, { foreignKey: 'modifiedBy', as: 'modifiedByUser' });

module.exports = Menu;
