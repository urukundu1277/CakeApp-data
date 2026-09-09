const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  validateRegister,
  validateLogin,
  validateMobileLogin,
  validateFirebaseLogin,
  validateForgotPassword,
} = require('../validators/auth.validator');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/mobile/login', validateMobileLogin, authController.mobileLogin);
router.post('/firebase/login', validateFirebaseLogin, authController.firebaseLogin);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
