const { Router } = require('express');
const productController = require('../controller/productController');
const router = Router();

// Routes for products
router.post('/addProduct', productController.addProduct);
router.post('/editProduct', productController.editProduct);
// router.get('/getProduct/:productId', productController.getProduct);  
// router.get('/getProduct', productController.getProduct);  

// Routes for product menu
router.post('/addProductMenu', productController.addProductMenu);
router.post('/editProductMenu', productController.editProductMenu);
// router.get('/getProductMenu/:menuId', productController.getProductMenu);  
// router.get('/getProductMenu', productController.getProductMenu);  

// Routes for modules
router.post('/addModule', productController.addModule);
router.post('/editModule', productController.editModule);
// router.get('/getModule/:moduleId', productController.getModule);  
// router.get('/getModule', productController.getModule);  

// Routes for menu
router.post('/addMenu', productController.addMenu);
router.post('/editMenu', productController.editMenu);
// router.get('/getMenu/:menuId', productController.getMenu);  
// router.get('/getMenu', productController.getMenu);  

module.exports = router;
