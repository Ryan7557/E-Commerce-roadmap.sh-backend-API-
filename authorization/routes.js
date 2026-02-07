const router = require('express').Router();
const AuthController = require('./controller');

router.post('/signup', AuthController.register);
router.post('/login', AuthController.login);

module.exports = router;