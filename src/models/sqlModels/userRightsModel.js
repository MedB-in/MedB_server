const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');
const Users = require('../sqlModels/userModel');
const Menu = require('../sqlModels/menuModel');

const UserRights = sequelize.define('UserRights', {
    userRightsId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Users,
            key: 'userId',
        },
    },
    companyId: {
        type: DataTypes.STRING, //make changes if required
        allowNull: true,
    },
    menuId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Menu,
            key: 'menuId',
        },
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
        type: DataTypes.BIGINT,
        allowNull: true,
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
    tableName: 'UserRights',
});

UserRights.belongsTo(Users, { foreignKey: 'userId', as: 'user' });
UserRights.belongsTo(Users, { foreignKey: 'createdBy', as: 'creator' });
UserRights.belongsTo(Users, { foreignKey: 'modifiedBy', as: 'modifier' });
UserRights.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' });

module.exports = UserRights;
