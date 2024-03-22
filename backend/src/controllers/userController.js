const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const authModel= require('../models/authModel')
const userModel = require('../models/userModel');
const notificationModel = require('../models/notificationModel')
const logger = require('../logger/logger');
const dotenv = require('dotenv');
dotenv.config();

function getAllUsers(req, res) {
    const { page, usersPerPage, search, course } = req.query;
    const pageNumber = parseInt(page) || 1;
    const perPage = parseInt(usersPerPage) || 5;

    userModel.getUsersWithSearch(search, course, pageNumber, perPage, (err, users, totalCount) => {
        if (err) {
            console.error('Error getting users:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const totalPages = Math.ceil(totalCount / perPage);
        res.json({ users, totalPages, totalCount });
    });
}

function getUserById(req, res) {
    const userId = req.query.id;

    userModel.getUserById(userId, (err, user) => {
        if (err) {
            console.error('Error getting user by ID:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    });
};

const createStudent = async (req, res) => {
    const user = req.body.login_user;
    const admin = await authModel.getAdminByEmail(user.email);
    if (!admin) {
        return res.status(404).json({ error: 'Admin data not found' });
    }
    const totalStudents = await userModel.getNumberOfStudents();

    const studentSchema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
    }).unknown();
    const { error, value } = studentSchema.validate(req.body);

    if (error) {
        console.log(error)
        return res.status(400).json({ error: error.details[0].message });
    }

    const newStudent = {
        uuid: uuidv4(),
        student_id: totalStudents + 1,
        name: value.name,
        email: value.email,
        course_id: req.body.courseId,
    };

    userModel.createUser(newStudent, (err, result) => {
        if (err) {
            console.error('Error creating student:', err);
            return res.status(500).json({ error: 'Failed to create student' });
        }


        const createdStudent = {
            uuid: newStudent.uuid,
            student_id: newStudent.id,
            name: newStudent.name,
            email: newStudent.email,
            course_id: newStudent.course_id,
        };
        const action = 'created';
        notificationModel.addNotification(admin.admin_id, newStudent.student_id, action, (err, notificationResult) => {
            if (err) {
                console.error('Error adding notification:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            return res.status(200).json({ message: 'Student created successfully', student: createdStudent });
        });
    });
};


const updateUserById = async (req, res) => {
    const user = req.body.login_user;
    const admin = await authModel.getAdminByEmail(user.email);
    if (!admin) {
        return res.status(404).json({ error: 'Admin data not found' });
    }
    const userSchema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required()
    });

    const student_id = req.query.id;
    const updatedUser = {
        name: req.body.name,
        email: req.body.email
    };

    const { error, value } = userSchema.validate(updatedUser);
    // Validation error
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    userModel.updateUserById(student_id, value, (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Add a notification when user is updated
        const action = 'updated';
        notificationModel.addNotification(admin.admin_id, student_id, action, (err, notificationResult) => {
            if (err) {
                console.error('Error adding notification:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.status(200).json({ message: 'User updated successfully', user: result });
        });
    });
}

function updatePartialUserById(req, res) {
    const userId = req.params.id;
    const updatedUser = {
        ...req.body
    };

    let dynamicSchema = Joi.object();

    Object.keys(updatedUser).forEach((key) => {
        switch (key) {
            case 'name':
                dynamicSchema = dynamicSchema.keys({
                    name: Joi.string().min(3).required()
                });
                break;
            case 'email':
                dynamicSchema = dynamicSchema.keys({
                    email: Joi.string().email().required()
                });
                break;
        }
    });

    const { error, value } = dynamicSchema.validate(updatedUser, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return res.status(400).json({ error: errorMessage });
    }

    userModel.updatePartialUserById(userId, value, (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json({ message: 'User updated-partially successfully', user: result });
    });
}

function deleteUserById(req, res) {
    const userId = req.params.id;

    userModel.deleteUserById(userId, (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'User deleted successfully' });
    });
}

const deactivateUserById = async(req, res) =>{
    const user = req.body.login_user;
    const admin = await authModel.getAdminByEmail(user.email);
    if (!admin) {
        return res.status(404).json({ error: 'Admin data not found' });
    }
    
    const student_id = req.query.id;
    // const userId = parseInt(req.params.id);

    const updatedUser = {
        is_active: 0,
    };

    userModel.updateUserById(student_id, updatedUser, (err, result) => {
        if (err) {
            console.error('Error deactivating user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const action = 'deleted';
        notificationModel.addNotification(admin.admin_id, student_id, action, (err, notificationResult) => {
            if (err) {
                console.error('Error adding notification:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.status(200).json({ message: 'User deactivated successfully', user: result });
        });
        
    });
}

module.exports = {
    createStudent,
    getAllUsers,
    getUserById,
    updateUserById,
    updatePartialUserById,
    deleteUserById,
    deactivateUserById,
};