const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/postgresConnection');
const Users = require('./userModel');
const Products = require('../sqlModels/productsModel');
const Menu = require('./menuModel');

const ProductMenu = sequelize.define('ProductMenu', {
    productMenuId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Products,
            key: 'productId',
        },
    },
    menuId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Menu,
            key: 'menuId',
        },
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
    tableName: 'ProductMenu',
});

ProductMenu.belongsTo(Products, { foreignKey: 'productId', as: 'product' });
ProductMenu.belongsTo(Menu, { foreignKey: 'menuId', as: 'menu' });
ProductMenu.belongsTo(Users, { foreignKey: 'createdBy', as: 'createdByUser' });
ProductMenu.belongsTo(Users, { foreignKey: 'modifiedBy', as: 'modifiedByUser' });

module.exports = ProductMenu;
