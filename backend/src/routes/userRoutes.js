const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/jwt');

// Routes for users
router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);
router.put('/updaterow/:id', auth, userController.updateUserById);
router.patch('/update-element/:id', auth, userController.updatePartialUserById);
router.delete('/delete/:id', auth, userController.deleteUserById);

module.exports = router;
