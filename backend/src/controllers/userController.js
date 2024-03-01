const Joi = require('joi');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const dotenv = require('dotenv');
dotenv.config();

function getAllUsers(req, res) {
    userModel.getAllUsers((err, users) => {
        if (err) {
            console.error('Error getting users:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(users);
    });
}


function getUserById(req, res) {
    const userId = req.params.id;

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
}

function updateUserById(req, res) {

    const userSchema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required()
    });

    const userId = req.params.id;
    const updatedUser = {
        name: req.body.name,
        email: req.body.email
    };

    const { error, value } = userSchema.validate(updatedUser);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    userModel.updateUserById(userId, value, (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'User updated successfully', user: result });
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
        res.json({ message: 'User updated partially successfully', user: result });
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

module.exports = {
    getAllUsers,
    getUserById,
    updateUserById,
    updatePartialUserById,
    deleteUserById
};