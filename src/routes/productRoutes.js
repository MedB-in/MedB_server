const { Router } = require('express');
const productController = require('../controller/productController');
const router = Router();

// Routes for products
router
    .route('/')
    .get(productController.getAllProducts)
    .post(productController.addProduct)

router
    .route('/:id')
    .put(productController.editProduct)

router
    .route('/menu')
    .get(productController.getProductMenu)
    .post(productController.addProductMenu)

module.exports = router;