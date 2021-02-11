const {Router} = require('express');
const UserController = require('./user.controller');

const router = Router();

router.post('/register', UserController.registerValidation, UserController.userCreate);
router.post('/login', UserController.loginValidation, UserController.userLogin);

module.exports = router;