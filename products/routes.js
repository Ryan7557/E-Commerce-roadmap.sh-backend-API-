const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getProductById } = require('./controller');
const checkAuthentication = require('../common/middlewares/IsAuthenticated');

router.post('/products', checkAuthentication, createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);

module.exports = router;