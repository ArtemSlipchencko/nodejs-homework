const {Router} = require('express');
const UserController = require('./user.controller');

const router = Router();

router.post('/register', UserController.registerValidation, UserController.userCreate);
router.post('/login', UserController.loginValidation, UserController.userLogin);
router.post('/logout', UserController.authorization, UserController.userLogout);
router.post('/current', UserController.authorization, UserController.userCurrent);

module.exports = router;