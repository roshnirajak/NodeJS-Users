const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const auth = require('../middleware/jwt');

// Routes for users
router.get('/', auth, userController.getAllUsers);
router.post('/', auth, userController.createStudent);
router.get('/:id', auth, userController.getUserById);
router.put('/update-row/:id', auth, userController.updateUserById);
router.patch('/update-element/:id', auth, userController.updatePartialUserById);
router.delete('/delete/:id', auth, userController.deactivateUserById);


module.exports = router;
