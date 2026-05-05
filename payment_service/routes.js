const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('./payment');
const checkAuthentication = require('../common/middlewares/IsAuthenticated');

router.post('/create-checkout-session', checkAuthentication, createCheckoutSession);

module.exports = router;