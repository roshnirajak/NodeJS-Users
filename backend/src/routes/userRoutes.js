const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const courseModel = require('../models/courseModel')
const auth = require('../middleware/jwt');

// Routes for users
router.get('/get-all', auth, userController.getAllUsers);
router.post('/create', auth, userController.createStudent);
router.get('/get-one', auth, userController.getUserById);
router.put('/update-row', auth, userController.updateUserById);
router.get('/get-course', auth, courseModel.getAllCourse);


//not for student only for admin (code for future reference)
router.patch('/update-element/:id', auth, userController.updatePartialUserById);
router.delete('/delete', auth, userController.deactivateUserById);


module.exports = router;
