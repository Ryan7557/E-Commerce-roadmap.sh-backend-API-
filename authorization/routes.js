const router = require('express').Router();
const { register, login, signupSchema, loginSchema } = require('./controller');
const validateRequest = require('../common/middlewares/ValidateRequest');

router.post('/signup', validateRequest(signupSchema), register);
router.post('/login', validateRequest(loginSchema), login);

module.exports = router;