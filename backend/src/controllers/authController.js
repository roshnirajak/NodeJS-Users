const Joi = require('joi');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const dotenv = require('dotenv');

dotenv.config();


function register(req, res) {

    const userSchema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(14).required(),
    });

    const { error, value } = userSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    bcrypt.hash(value.password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error in encryption:', err);
            return res.status(500).json({ error: 'Error in encryption' });
        }
        const newUser = {
            name: value.name,
            email: value.email,
            password: hash
        };

        userModel.registerUser(newUser, (err, result) => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).json({ error: error.details[0].message });
            }

            const createdUser = {
                name: newUser.name,
                email: newUser.email,
                password: value.password
            };

            return res.status(200).json({ message: 'User created successfully', user: createdUser });
        });
    })
}

// Joi for login input
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

function login(req, res) {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    userModel.loginUser(email, password, (err, user) => {
        if (err) {
            console.error('Error logging in user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.TOKEN_SECRET, { expiresIn: '2m' });

        // Storing token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, 
            sameSite: 'None',
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        });

        res.json({ message: 'Login successful', token });
    });
}

module.exports = {
    register,
    login,
};