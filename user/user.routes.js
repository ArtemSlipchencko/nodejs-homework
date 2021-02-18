const {Router} = require('express');
const UserController = require('./user.controller');
const multer = require('multer');
const path = require('path');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'public/');
//     },
//     filename: function (req, file, cb) {
//       const {ext} = path.parse(file.originalname);
//       cb(null, `${Date.now()}${ext}`);
//     }
//   });
  
// const public = multer({storage});

const router = Router();
// public.single('userAvatar'),

router.post('/register', UserController.registerValidation, UserController.createAvatar, UserController.userCreate);
router.post('/login', UserController.loginValidation, UserController.userLogin);
router.post('/logout', UserController.authorization, UserController.userLogout);
router.post('/current', UserController.authorization, UserController.userCurrent);

module.exports = router;