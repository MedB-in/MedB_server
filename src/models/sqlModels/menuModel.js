const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection'); // Adjust if necessary
const Users = require('../sqlModels/userModel'); // Assuming you have a User model
const Module = require('../sqlModels/moduleModel'); // Assuming you have a Module model

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
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
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

// Define associations
Menu.belongsTo(Module, { foreignKey: 'moduleId', as: 'module' });
Menu.belongsTo(Users, { foreignKey: 'createdBy', as: 'createdByUser' });
Menu.belongsTo(Users, { foreignKey: 'modifiedBy', as: 'modifiedByUser' });

// Export the model
module.exports = Menu;
