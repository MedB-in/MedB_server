const catchAsync = require("../util/catchAsync");
const bcrypt = require("bcrypt");
const AppError = require("../util/appError");
const env = require('../util/validateEnv');
const jwt = require("jsonwebtoken");
const User = require("../models/sqlModels/userModel");
const UserRights = require('../models/sqlModels/userRightsModel');

//Function to register a new user
exports.register = catchAsync(async (req, res, next) => {
    console.log(req.body);

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
    } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
        throw new AppError({ statusCode: 400, message: "Email, password, and name are required." });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new AppError({ statusCode: 409, message: "Email already registered." });
    }

    // Hash the password
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
        isActive: true,
        createdOn: new Date(),
        createdBy: 1,
        lastLoginOn: new Date(),
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

    const user = await User.findOne({ where: { email } }); // Sequelize query
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
    const createdBy = req.userId; 
    const userId = req.body.idUser;

    // Validate required fields
    if (!userId || !companyId || !menuId || viewAllowed === undefined || editAllowed === undefined || createAllowed === undefined || deleteAllowed === undefined) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for user rights' });
    }

    // Check if the user rights already exist for this user
    const existingUserRights = await UserRights.findOne({
        where: {
            userId,
            companyId,
            menuId
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

