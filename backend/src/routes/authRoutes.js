const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/jwt');


router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh-token', authController.refreshToken)
router.get('/profile', auth, authController.getProfile);
router.patch('/change-password', auth, authController.changePassword);



module.exports = router;