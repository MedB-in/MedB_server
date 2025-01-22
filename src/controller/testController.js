const catchAsync = require("../util/catchAsync");
const bcrypt = require("bcrypt");
const AppError = require("../util/appError");
const env = require('../util/validateEnv');
const jwt = require("jsonwebtoken");
const User = require("../models/sqlModels/userModel");
const UserRights = require('../models/sqlModels/userRightsModel');
const Products = require("../models/sqlModels/productsModel");

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
            companyId,
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
