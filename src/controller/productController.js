const catchAsync = require('../util/catchAsync');
const productService = require('../services/productServices');


// Controller to get products
exports.getAllProducts = catchAsync(async (req, res, next) => {
    const products = await productService.getAllProducts();
    return res.status(200).json({ products });
});

// Controller to add a product
exports.addProduct = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const data = { ...req.body, createdBy: userId };

    const newProduct = await productService.addProduct(data);

    return res.status(201).json({
        status: 'success',
        message: 'Product added successfully',
        data: newProduct,
    });
});

// Controller to edit an existing product
exports.editProduct = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const data = { ...req.body, modifiedBy: userId };

    const updatedProduct = await productService.editProduct(data);

    return res.status(200).json({
        status: 'success',
        message: 'Product updated successfully',
        data: updatedProduct,
    });
});


//Controller to get menu
exports.getProductMenu = catchAsync(async (req, res, next) => {
    const productMenu = await productService.getMenuList();
    
    return res.status(200).json({ productMenu });
});


// Controller to add a menu for a product
exports.addProductMenu = catchAsync(async (req, res, next) => {
    const { productId, menuId } = req.body;
    const createdBy = req.user.userId;

    const data = { productId, menuId, createdBy };

    const productMenu = await productService.addProductMenu(data);

    return res.status(201).json({
        status: 'success',
        message: 'Menu added to product successfully',
        data: productMenu,
    });
});

// Controller to edit a menu for a product
exports.editProductMenu = catchAsync(async (req, res, next) => {
    const { productMenuId, productId, menuId } = req.body;
    const modifiedBy = req.user.userId;

    const data = { productMenuId, productId, menuId, modifiedBy };

    const updatedProductMenu = await productService.editProductMenu(data);

    return res.status(200).json({
        status: 'success',
        message: 'Product menu updated successfully',
        data: updatedProductMenu,
    });
});

// Controller to add a menu
exports.addMenu = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const data = { ...req.body, createdBy: userId };

    const newMenu = await productService.addMenu(data);

    return res.status(201).json({
        status: 'success',
        message: 'Menu added successfully',
        data: newMenu,
    });
});

// Controller to edit a menu
exports.editMenu = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const data = { ...req.body, modifiedBy: userId };

    const updatedMenu = await productService.editMenu(data);

    return res.status(200).json({
        status: 'success',
        message: 'Menu updated successfully',
        data: updatedMenu,
    });
});
