const express = require('express');
const router = express.Router();
const { createProduct } = require('./controller');
const checkAuthentication = require('../common/middlewares/IsAuthenticated');

router.post('/products', checkAuthentication, createProduct);

module.exports = router;