const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const env = require('../utils/validateEnv');
const jwt = require("jsonwebtoken");
const User = require("../models/sqlModels/userModel");
const UserRights = require('../models/sqlModels/userRightsModel');
const Products = require("../models/sqlModels/productsModel");
const ProductMenu = require("../models/sqlModels/productMenuModel");
const Module = require("../models/sqlModels/moduleModel");
const Menu = require("../models/sqlModels/menuModel");
const Subscription = require("../models/sqlModels/subscriptionModel");

//Function to register a new user
exports.register = catchAsync(async (req, res, next) => {
    const {
        email,
        password,
        name,
        firstName,
        lastName,
        contactNo,
        address1,
        address2,
        nationality,
        pin,
        signature,
        profilePicture,
        loginKey,
        redirection,
        designation,
    } = req.body;

    if (!email || !password || !name) {
        throw new AppError({ statusCode: 400, message: "Email, password, and name are required." });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new AppError({ statusCode: 409, message: "Email already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
        email,
        password: hashedPassword,
        name,
        firstName,
        lastName,
        contactNo,
        address1,
        address2,
        nationality,
        pin,
        signature,
        profilePicture,
        loginKey,
        redirection,
        designation,
        isActive: true,
        createdOn: new Date(),
        createdBy: 1,
        lastLoginOn: new Date(),
        modifiedOn: null,
        modifiedBy: null,
        salt,
    });

    res.status(201).json({
        status: "success",
        message: "User registered successfully.",
        data: {
            userId: newUser.userId,
            email: newUser.email,
            name: newUser.name,
        },
    });
});


//Function to login
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError({ statusCode: 400, message: 'Credentials required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new AppError({ statusCode: 401, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new AppError({ statusCode: 401, message: 'Invalid credentials' });
    }

    // Generate an access token
    const accessToken = jwt.sign(
        { userId: user.userId, role: user.designation },
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: env.ACCESS_TOKEN_LIFE }
    );

    return res.status(200).json({ accessToken, userId: user.userId });
});


//Function to add user rights   
exports.addUserRights = catchAsync(async (req, res, next) => {

    const { companyId, menuId, viewAllowed, editAllowed, createAllowed, deleteAllowed } = req.body;
    const createdBy = req.body.userId; //change to req.user.userId
    const userId = req.body.idUser;

    if (!userId || !companyId || !menuId || viewAllowed === undefined || editAllowed === undefined || createAllowed === undefined || deleteAllowed === undefined) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for user rights' });
    }

    // Check if the user rights already exist for this user
    const existingUserRights = await UserRights.findOne({
        where: {
            userId,
            menuId,
        }
    });

    if (existingUserRights) {
        throw new AppError({ statusCode: 400, message: 'User rights already exist for this user' });
    }

    // If no existing rights, create new user rights
    const userRights = await UserRights.create({
        userId,
        companyId,
        menuId,
        viewAllowed,
        editAllowed,
        createAllowed,
        deleteAllowed,
        createdBy,
        createdOn: new Date(),
    });

    return res.status(201).json({
        status: 'success',
        message: 'User rights added successfully',
        data: userRights,
    });
});

//Function to Edit user rights
exports.editUserRights = catchAsync(async (req, res, next) => {

    const { companyId, menuId, viewAllowed, editAllowed, createAllowed, deleteAllowed } = req.body;
    const modifiedBy = req.body.userId; //change to req.user.userId
    const userId = req.body.idUser;

    if (!userId || !companyId || !menuId || viewAllowed === undefined || editAllowed === undefined || createAllowed === undefined || deleteAllowed === undefined) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for user rights' });
    }

    // Check if the user rights exist for this user
    const existingUserRights = await UserRights.findOne({
        where: {
            userId,
            companyId,
            menuId,
        }
    });

    if (!existingUserRights) {
        throw new AppError({ statusCode: 404, message: 'User rights not found for this user' });
    }

    await UserRights.update(
        {
            viewAllowed,
            editAllowed,
            createAllowed,
            deleteAllowed,
            modifiedBy,
            modifiedOn: new Date(),
        },
        {
            where: {
                userId,
                companyId,
                menuId,
            }
        }
    );

    return res.status(200).json({
        status: 'success',
        message: 'User rights updated successfully',
    });
});


// Function to add a product
exports.addProduct = catchAsync(async (req, res, next) => {
    const userId = req.body.userId; //change to req.user.userId
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
    } = req.body;

    if (!productName || isActive === undefined || isPublic === undefined || isFree === undefined || isTrial === undefined) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields: productName, isActive, isPublic, isFree, isTrial' });
    }

    // Check if the product already exists
    const existingProduct = await Products.findOne({ where: { productName } });
    if (existingProduct) {
        throw new AppError({ statusCode: 409, message: 'Product with this name already exists' });
    }

    // Create the new product
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
        createdBy: userId,
        createdOn: new Date(),
        modifiedBy: null,
        modifiedOn: null,
    });

    return res.status(201).json({
        status: 'success',
        message: 'Product added successfully',
        data: {
            productId: newProduct.productId,
            productName: newProduct.productName,
            isActive: newProduct.isActive,
            isPublic: newProduct.isPublic,
            isFree: newProduct.isFree,
            isTrial: newProduct.isTrial,
        },
    });
});


// Function to edit an existing product
exports.editProduct = catchAsync(async (req, res, next) => {
    const userId = req.body.userId; //change to req.user.userId
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
    } = req.body;

    if (!productId) {
        throw new AppError({ statusCode: 400, message: 'Missing required field: productId' });
    }

    // Find the existing product by ID
    const existingProduct = await Products.findOne({ where: { productId } });
    if (!existingProduct) {
        throw new AppError({ statusCode: 404, message: 'Product not found' });
    }

    // Update the product
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
        modifiedBy: userId,
        modifiedOn: new Date(),
    });

    return res.status(200).json({
        status: 'success',
        message: 'Product updated successfully',
        data: {
            productId: updatedProduct.productId,
            productName: updatedProduct.productName,
            isActive: updatedProduct.isActive,
            isPublic: updatedProduct.isPublic,
            isFree: updatedProduct.isFree,
            isTrial: updatedProduct.isTrial,
        },
    });
});


//Function to add menu for product
exports.addProductMenu = catchAsync(async (req, res, next) => {
    const { productId, menuId } = req.body;
    const createdBy = req.body.userId; // Change to req.user.userId

    if (!productId || !menuId || !createdBy) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for product menu creation' });
    }

    // Check if the product exists
    const productExists = await Products.findByPk(productId);
    if (!productExists) {
        throw new AppError({ statusCode: 404, message: 'Product not found' });
    }

    // Check if the menu exists
    const menuExists = await Menu.findByPk(menuId);
    if (!menuExists) {
        throw new AppError({ statusCode: 404, message: 'Menu not found' });
    }

    const productMenu = await ProductMenu.create({
        productId,
        menuId,
        createdOn: new Date(),
        createdBy,
        modifiedOn: null,
        modifiedBy: null,
    });

    return res.status(201).json({
        status: 'success',
        message: 'Menu added to product successfully',
        data: productMenu,
    });
});


//Function to Edit menu for product
exports.editProductMenu = catchAsync(async (req, res, next) => {
    const { productMenuId, productId, menuId } = req.body;
    const modifiedBy = req.body.userId; // Change to req.user.userId


    if (!productMenuId || !productId || !menuId || !modifiedBy) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for product menu update' });
    }

    // Check if the product exists
    const productExists = await Products.findByPk(productId);
    if (!productExists) {
        throw new AppError({ statusCode: 404, message: 'Product not found' });
    }

    // Check if the menu exists
    const menuExists = await Menu.findByPk(menuId);
    if (!menuExists) {
        throw new AppError({ statusCode: 404, message: 'Menu not found' });
    }

    // Check if the product menu exists
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

    return res.status(200).json({
        status: 'success',
        message: 'Product menu updated successfully',
        data: updatedProductMenu,
    });
});


// Function to add a module
exports.addModule = catchAsync(async (req, res, next) => {
    const { moduleName, sortOrder, moduleIcon } = req.body;
    const createdBy = req.body.userId; // Change to req.user.userId

    if (!moduleName || sortOrder === undefined || !createdBy) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for module' });
    }

    // Check if a module with the same name already exists
    const existingModule = await Module.findOne({
        where: { moduleName },
    });

    if (existingModule) {
        throw new AppError({ statusCode: 400, message: 'Module with this name already exists' });
    }

    const module = await Module.create({
        moduleName,
        sortOrder,
        moduleIcon,
        createdBy,
        createdOn: new Date(),
    });

    return res.status(201).json({
        status: 'success',
        message: 'Module added successfully',
        data: module,
    });
});


// Function to edit a module
exports.editModule = catchAsync(async (req, res, next) => {
    const { moduleName, sortOrder, moduleIcon, moduleId } = req.body;
    const modifiedBy = req.body.userId; // Change to req.user.userId 

    if (!moduleId || modifiedBy === undefined) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for module update' });
    }

    // Check if the module exists
    const existingModule = await Module.findOne({
        where: { moduleId },
    });

    if (!existingModule) {
        throw new AppError({ statusCode: 404, message: 'Module not found' });
    }

    await Module.update(
        {
            moduleName,
            sortOrder,
            moduleIcon,
            modifiedBy,
            modifiedOn: new Date(),
        },
        { where: { moduleId } }
    );

    return res.status(200).json({
        status: 'success',
        message: 'Module updated successfully',
    });
});

//Function to add menu
exports.addMenu = catchAsync(async (req, res, next) => {
    const { moduleId, menuName, actionName, controllerName, isActive, sortOrder, menuIcon } = req.body;
    const createdBy = req.body.userId; // change to req.user.userId

    if (!moduleId || !menuName || isActive === undefined || !sortOrder) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for menu creation' });
    }

    // Check if the specified module exists
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

    return res.status(201).json({
        status: 'success',
        message: 'Menu added successfully',
        data: menu,
    });
});

// Function to edit menu
exports.editMenu = catchAsync(async (req, res, next) => {
    const { menuId, moduleId, menuName, actionName, controllerName, isActive, sortOrder, menuIcon } = req.body;
    const modifiedBy = req.body.userId; // Change to use authenticated user ID

    if (!menuId) {
        throw new AppError({ statusCode: 400, message: "menuId is required" });
    }

    // Check if the specified menu exists
    const menuExists = await Menu.findByPk(menuId);
    if (!menuExists) {
        throw new AppError({ statusCode: 404, message: "Menu not found" });
    }

    // Get the current menu data
    const updatedData = {
        moduleId: moduleId ?? menuExists.moduleId,
        menuName: menuName ?? menuExists.menuName,
        actionName: actionName ?? menuExists.actionName,
        controllerName: controllerName ?? menuExists.controllerName,
        isActive: isActive !== undefined ? isActive : menuExists.isActive, 
        sortOrder: sortOrder ?? menuExists.sortOrder,
        menuIcon: menuIcon ?? menuExists.menuIcon,
        modifiedBy,
        modifiedOn: new Date(),
    };

    await Menu.update(updatedData, { where: { menuId } });

    return res.status(200).json({
        status: "success",
        message: "Menu updated successfully",
    });
});



// Function to add subscription
exports.addSubscription = catchAsync(async (req, res, next) => {
    const { userId, productId, startOn, endOn, isPaid, days, period, netAmount, orderId } = req.body;

    const createdBy = req.body.userId; // change to req.user.userId

    if (!userId || !productId || !startOn || !endOn || isPaid === undefined || !createdBy) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for subscription creation' });
    }

    // Check if the user exists
    const userExists = await User.findByPk(userId);
    if (!userExists) {
        throw new AppError({ statusCode: 404, message: 'User not found' });
    }

    // Check if the product exists
    const productExists = await Products.findByPk(productId);
    if (!productExists) {
        throw new AppError({ statusCode: 404, message: 'Product not found' });
    }

    // Dummy subscription creation for now
    // the subscription's time and date would depend on the actual payment process
    // the 'days', 'netAmount', 'period', and other data would depend on the product chosen by the user

    const subscription = await Subscription.create({
        userId,
        productId,
        startOn,
        endOn,
        isPaid,
        days,
        period,
        netAmount,
        createdOn: new Date(),
        createdBy,
        modifiedOn: null,
        modifiedBy: null,
        orderId,
    });

    return res.status(201).json({
        status: 'success',
        message: 'Subscription added successfully',
        data: subscription, //change response
    });
});