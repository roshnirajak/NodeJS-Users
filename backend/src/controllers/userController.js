const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const logger = require('../logger/logger');
const dotenv = require('dotenv');
dotenv.config();

function getAllUsers(req, res) {
    const { page, usersPerPage, search } = req.query;
    const pageNumber = parseInt(page) || 1;
    const perPage = parseInt(usersPerPage) || 5;

    if (search) {
        userModel.getUsersWithSearch(search, pageNumber, perPage, (err, users, totalCount) => {
            if (err) {
                console.error('Error getting users:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            const totalPages = Math.ceil(totalCount / perPage);
            res.json({ users, totalPages, totalCount });
        });
    } else {
        userModel.getAllUsers(pageNumber, perPage, (err, users, totalCount) => {
            if (err) {
                console.error('Error getting users:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            const totalPages = Math.ceil(totalCount / perPage);
            res.json({ users, totalPages, totalCount });
        });
    }
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
    const login_user = req.body.login_user;
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
        email: value.email
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
            email: newStudent.email
        };

        return res.status(200).json({ message: 'Student created successfully', student: createdStudent });
    });
};


function updateUserById(req, res) {

    const userSchema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required()
    });

    const userId = req.query.id;
    const updatedUser = {
        name: req.body.name,
        email: req.body.email
    };

    const { error, value } = userSchema.validate(updatedUser);
    // Validation error
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    userModel.updateUserById(userId, value, (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ message: 'User updated successfully', user: result });
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

function deactivateUserById(req, res) {
    const login_user = req.body.login_user;
    const userId = req.query.id;
    // const userId = parseInt(req.params.id);
    console.log("UserId:", userId)
    const updatedUser = {
        is_active: 0,
    };

    userModel.updateUserById(userId, updatedUser, (err, result) => {
        if (err) {
            console.error('Error deactivating user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ message: 'User deactivated successfully', user: result });
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