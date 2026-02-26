const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, productSchema } = require('./controller');
const checkAuthentication = require('../common/middlewares/IsAuthenticated');
const validateRequest = require('../common/middlewares/ValidateRequest');

router.post('/products', checkAuthentication, validateRequest(productSchema), createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', checkAuthentication, validateRequest(productSchema.partial()), updateProduct);
router.delete('/products/:id', checkAuthentication, deleteProduct);

module.exports = router;