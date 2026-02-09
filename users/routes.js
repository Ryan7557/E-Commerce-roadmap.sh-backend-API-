const router = require('express').Router();
const UserController = require('./controller');
const checkAuth = require('../common/middlewares/IsAuthenticated');
const checkPermissions = require('../common/middlewares/CheckPermissions');

router.get('/', checkAuth, UserController.getUserProfile);
router.get('/getAll', checkAuth, checkPermissions.has('admin'), UserController.getAllUsersProfiles);

module.exports = router;