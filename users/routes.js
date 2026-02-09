const router = require('express').Router();
const UserController = require('./controller');
const checkAuth = require('../common/middlewares/IsAuthenticated');
const checkPermissions = require('../common/middlewares/CheckPermissions');

router.get('/', checkAuth.checkAuthentication, UserController.getUserProfile);
router.get('/getAll', checkAuth.checkAuthentication, checkPermissions.has('ADMIN'), UserController.getAllUsersProfiles);