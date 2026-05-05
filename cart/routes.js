const express = require('express');
const router = express.Router();
const { addToCart, removeFromCart } = require('./controller');
const checkAuthentication = require('../common/middlewares/IsAuthenticated');

router.post('/add-product', checkAuthentication, addToCart);
router.delete('/:id', checkAuthentication, removeFromCart);

module.exports = router;