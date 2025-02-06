const catchAsync = require("../util/catchAsync");
const controlPanelServices = require("../services/controlPanelServices");
const AppError = require("../util/appError");

// Controller to get all menus with modules
exports.getAllMenus = catchAsync(async (req, res, next) => {
    const userId = req.user.userId;
    const menuData = await controlPanelServices.getAllMenusWithModules(userId);
    return res.status(200).json({ menuData });
});

// Controller to add a Module
exports.addModule = catchAsync(async (req, res, next) => {
    const { moduleName, sortOrder, moduleIcon } = req.body;
    const createdBy = req.user.userId;

    if (!moduleName || sortOrder === undefined || moduleIcon === undefined || !createdBy) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for module' });
    }

    const moduleData = {
        moduleName,
        sortOrder,
        moduleIcon,
        createdBy,
    };

    const module = await controlPanelServices.addModuleService(moduleData);

    return res.status(201).json({
        status: 'success',
        message: 'Module added successfully',
        data: module,
    });
});

// Controller to edit a Module
exports.editModule = catchAsync(async (req, res, next) => {
    const { moduleName, sortOrder, moduleIcon } = req.body;
    const moduleId = req.params.id
    const modifiedBy = req.user.userId;

    if (!moduleId || modifiedBy === undefined) {
        return next(new AppError({ statusCode: 400, message: 'Missing required fields for module update' }));
    }

    const result = await controlPanelServices.editModuleService(moduleId, { moduleName, sortOrder, moduleIcon }, modifiedBy);
    return res.status(result.statusCode).json({
        status: result.status,
        message: result.message,
    });
});


// Controller to add a Menu
exports.addMenu = catchAsync(async (req, res, next) => {
    const { moduleId, menuName, actionName, controllerName, isActive, sortOrder, menuIcon } = req.body;
    const createdBy = req.user.userId;

    if (!moduleId || !menuName || !controllerName || !actionName || !menuIcon || !createdBy || isActive === undefined || !sortOrder) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for menu creation' });
    }

    const result = await controlPanelServices.addMenuService({
        moduleId,
        menuName,
        actionName,
        controllerName,
        isActive,
        sortOrder,
        menuIcon,
        createdBy
    });

    return res.status(result.statusCode).json({
        status: result.status,
        message: result.message,
        data: result.data,
    });
});


// Controller to edit a menu
exports.editMenu = catchAsync(async (req, res, next) => {
    const { moduleId, menuName, actionName, controllerName, isActive, sortOrder, menuIcon } = req.body;
    const menuId = req.params.id;
    const modifiedBy = req.user.userId;

    if (!moduleId || modifiedBy === undefined) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for menu creation' });
    }
    await controlPanelServices.editMenuService(menuId, { moduleId, menuName, actionName, controllerName, isActive, sortOrder, menuIcon }, modifiedBy);

    return res.status(200).json({
        status: "success",
        message: "Menu updated successfully",
    });
});