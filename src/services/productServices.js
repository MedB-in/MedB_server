const { sequelize } = require('../config/postgresConnection');
const Menu = require('../models/sqlModels/menuModel');
const Module = require('../models/sqlModels/moduleModel');
const ProductMenu = require('../models/sqlModels/productMenuModel');
const Products = require('../models/sqlModels/productsModel');
const AppError = require('../utils/appError');


//Service to get all products
exports.getAllProducts = async () => {
    try {
        const query = `SELECT get_all_products_with_menus_and_modules();`;

        const [productData] = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
        });

        if (!productData) {
            throw new AppError({ statusCode: 404, message: "No product found" });
        }

        return productData.get_all_products_with_menus_and_modules;
    } catch (error) {
        throw new AppError({ statusCode: 500, message: "Error fetching product data", error });
    }
};


// Service to add a product
exports.addProduct = async (data) => {
    const {
        productName,
        productType,
        description,
        notes,
        values,
        isPublic,
        isActive,
        isFree,
        isTrial,
        amount,
        taxAmount,
        netAmount,
        trialDays,
        createdBy
    } = data;

    if (!productName || isActive === undefined || isPublic === undefined || isFree === undefined || isTrial === undefined) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields' });
    }

    const existingProduct = await Products.findOne({ where: { productName } });
    if (existingProduct) {
        throw new AppError({ statusCode: 409, message: 'Product with this name already exists' });
    }

    const newProduct = await Products.create({
        productName,
        productType: productType || null,
        description: description || null,
        notes: notes || null,
        values: values || null,
        isPublic,
        isActive,
        isFree,
        isTrial,
        amount: amount || null,
        taxAmount: taxAmount || null,
        netAmount: netAmount || null,
        trialDays: trialDays || null,
        createdBy,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: null,
    });

    return newProduct;
};


// Service to edit an existing product
exports.editProduct = async (data) => {
    const {
        productId,
        productName,
        productType,
        description,
        notes,
        values,
        isPublic,
        isActive,
        isFree,
        isTrial,
        amount,
        taxAmount,
        netAmount,
        trialDays,
        modifiedBy
    } = data;

    if (!productId) {
        throw new AppError({ statusCode: 400, message: 'Missing required field: productId' });
    }

    const existingProduct = await Products.findOne({ where: { productId } });
    if (!existingProduct) {
        throw new AppError({ statusCode: 404, message: 'Product not found' });
    }

    const updatedProduct = await existingProduct.update({
        productName: productName || existingProduct.productName,
        productType: productType || existingProduct.productType,
        description: description || existingProduct.description,
        notes: notes || existingProduct.notes,
        values: values || existingProduct.values,
        isPublic: isPublic !== undefined ? isPublic : existingProduct.isPublic,
        isActive: isActive !== undefined ? isActive : existingProduct.isActive,
        isFree: isFree !== undefined ? isFree : existingProduct.isFree,
        isTrial: isTrial !== undefined ? isTrial : existingProduct.isTrial,
        amount: amount !== undefined ? amount : existingProduct.amount,
        taxAmount: taxAmount !== undefined ? taxAmount : existingProduct.taxAmount,
        netAmount: netAmount !== undefined ? netAmount : existingProduct.netAmount,
        trialDays: trialDays !== undefined ? trialDays : existingProduct.trialDays,
        modifiedBy,
        modifiedOn: new Date(),
    });

    return updatedProduct;
};

//Service to get menu list
exports.getMenuList = async () => {
    try {
        const menuList = await Menu.findAll();
        return menuList;
    } catch (error) {
        throw new AppError({ statusCode: 500, message: "Error fetching menu list", error });
    }
};

// Service to add a product menu
exports.addProductMenu = async (data) => {
    const { productId, menuId, createdBy } = data;

    const productExists = await Products.findByPk(productId);
    if (!productExists) {
        throw new AppError({ statusCode: 404, message: 'Product not found' });
    }

    const menuExists = await Menu.findByPk(menuId);
    if (!menuExists) {
        throw new AppError({ statusCode: 404, message: 'Menu not found' });
    }

    const existingProductMenu = await ProductMenu.findOne({
        where: { productId, menuId },
    });

    if (existingProductMenu) {
        throw new AppError({
            statusCode: 400,
            message: 'This menu is already added to the product.',
        });
    }

    const productMenu = await ProductMenu.create({
        productId,
        menuId,
        createdOn: new Date(),
        createdBy,
        modifiedOn: null,
        modifiedBy: null,
    });

    return productMenu;
};

// Service to edit a product menu
exports.editProductMenu = async (data) => {
    const { productMenuId, productId, menuId, modifiedBy } = data;

    const productExists = await Products.findByPk(productId);
    if (!productExists) {
        throw new AppError({ statusCode: 404, message: 'Product not found' });
    }

    const menuExists = await Menu.findByPk(menuId);
    if (!menuExists) {
        throw new AppError({ statusCode: 404, message: 'Menu not found' });
    }

    const productMenuExists = await ProductMenu.findByPk(productMenuId);
    if (!productMenuExists) {
        throw new AppError({ statusCode: 404, message: 'Product menu association not found' });
    }

    const updatedProductMenu = await productMenuExists.update({
        productId,
        menuId,
        modifiedOn: new Date(),
        modifiedBy,
    });

    return updatedProductMenu;
};

// Service to add a menu
exports.addMenu = async (data) => {
    const { moduleId, menuName, actionName, controllerName, isActive, sortOrder, menuIcon, createdBy } = data;

    if (!moduleId || !menuName || isActive === undefined || !sortOrder) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for menu creation' });
    }

    const moduleExists = await Module.findByPk(moduleId);
    if (!moduleExists) {
        throw new AppError({ statusCode: 404, message: 'Module not found' });
    }

    const menu = await Menu.create({
        moduleId,
        menuName,
        actionName,
        controllerName,
        isActive,
        sortOrder,
        menuIcon,
        createdBy,
        createdOn: new Date(),
    });

    return menu;
};

// Service to edit a menu
exports.editMenu = async (data) => {
    const { menuId, moduleId, menuName, actionName, controllerName, isActive, sortOrder, menuIcon, modifiedBy } = data;

    const menuExists = await Menu.findByPk(menuId);
    if (!menuExists) {
        throw new AppError({ statusCode: 404, message: 'Menu not found' });
    }

    const moduleExists = await Module.findByPk(moduleId);
    if (!moduleExists) {
        throw new AppError({ statusCode: 404, message: 'Module not found' });
    }

    await Menu.update(
        {
            moduleId,
            menuName,
            actionName,
            controllerName,
            isActive,
            sortOrder,
            menuIcon,
            modifiedBy,
            modifiedOn: new Date(),
        },
        {
            where: { menuId },
        }
    );

    return { menuId, message: 'Menu updated successfully' };
};
