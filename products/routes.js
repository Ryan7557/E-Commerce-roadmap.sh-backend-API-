const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, productSchema } = require('./controller');
const checkAuthentication = require('../common/middlewares/IsAuthenticated');
const validateRequest = require('../common/middlewares/ValidateRequest');

router.post('/', checkAuthentication, validateRequest(productSchema), createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', checkAuthentication, validateRequest(productSchema.partial()), updateProduct);
router.delete('/:id', checkAuthentication, deleteProduct);

module.exports = router;