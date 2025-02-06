const { sequelize } = require('../config/postgresConnection');
const Menu = require('../models/sqlModels/menuModel');
const Module = require('../models/sqlModels/moduleModel');
const AppError = require("../util/appError");

// Service function to fetch all menus with modules
exports.getAllMenusWithModules = async () => {
    try {
        const query = `SELECT get_all_menus_with_modules();`;

        const [menuData] = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
        });

        if (!menuData) {
            throw new AppError({ statusCode: 404, message: "No menus found" });
        }

        return menuData.get_all_menus_with_modules;
    } catch (error) {
        throw new AppError({ statusCode: 500, message: "Error fetching menu data", error });
    }
};

// Service function to add a module
exports.addModuleService = async (moduleData) => {
    const { moduleName, sortOrder, moduleIcon, createdBy } = moduleData;

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

    return module;
};

// Service function to edit a module
exports.editModuleService = async (moduleId, moduleName, sortOrder, moduleIcon, modifiedBy) => {
    // Check if the module exists
    const existingModule = await Module.findOne({
        where: { moduleId },
    });

    if (!existingModule) {
        throw new AppError({ statusCode: 404, message: 'Module not found' });
    }

    // Update the module
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

    return {
        statusCode: 200,
        status: 'success',
        message: 'Module updated successfully',
    };
};

// Service function to add a menu
exports.addMenuService = async ({ moduleId, menuName, actionName, controllerName, isActive, sortOrder, menuIcon, createdBy }) => {

    if (!moduleId || !menuName || isActive === undefined || !sortOrder) {
        throw new AppError({ statusCode: 400, message: 'Missing required fields for menu creation' });
    }

    const existingMenu = await Menu.findOne({
        where: { menuName },
    });

    if (existingMenu) {
        throw new AppError({ statusCode: 400, message: 'Menu with this name already exists' });
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

    return {
        statusCode: 201,
        status: 'success',
        message: 'Menu added successfully',
        data: menu
    };
};


// Service function to edit a menu
exports.editMenuService = async (menuId, data, modifiedBy) => {
    if (!menuId) {
        throw new AppError({ statusCode: 400, message: "menuId is required" });
    }
    const menuExists = await Menu.findOne({ where: { menuId } });

    if (!menuExists) {
        throw new AppError({ statusCode: 404, message: "Menu not found" });
    }

    const updatedData = {
        moduleId: data.moduleId ?? menuExists.moduleId,
        menuName: data.menuName ?? menuExists.menuName,
        actionName: data.actionName ?? menuExists.actionName,
        controllerName: data.controllerName ?? menuExists.controllerName,
        isActive: data.isActive !== undefined ? data.isActive : menuExists.isActive,
        sortOrder: data.sortOrder ?? menuExists.sortOrder,
        menuIcon: data.menuIcon ?? menuExists.menuIcon,
        modifiedBy,
        modifiedOn: new Date(),
    };

    await Menu.update(updatedData, { where: { menuId } });
};

