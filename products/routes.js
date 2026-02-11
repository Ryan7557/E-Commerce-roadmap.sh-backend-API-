const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('./controller');
const checkAuthentication = require('../common/middlewares/IsAuthenticated');

router.post('/products', checkAuthentication, createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', checkAuthentication, updateProduct);
router.delete('/products/:id', checkAuthentication, deleteProduct);

module.exports = router;