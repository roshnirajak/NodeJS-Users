const Joi = require('joi');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const dotenv = require('dotenv');
dotenv.config();

const jwtConfig = require('../helpers/jwtConfig');


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

        const accessToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '0.5m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1m' }
        );
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true, 
            sameSite: 'None',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, 
            sameSite: 'None',
        });
        res.status(201).json({ message: 'Login successful', 'accessToken': accessToken, 'refreshToken': refreshToken });
    });
}

function refreshToken(req, res) {
    const authHeader = req.headers['authorization']

    console.log(authHeader);

    let refresh_token = authHeader && authHeader.split(' ')[1];

    console.log("REFRESH_TOKEN2", refresh_token);

    if (refresh_token == null) {
        res.status(402).send({ error: true, message: "Token not found" }); // Token doesn't exist
        return res.end();
    }

    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) {
            res.status(401).send({ error: true, message: "Refresh token is expired or invalid" }); // Refresh token is expired or invalid
            return res.end();
        }

        if (user != undefined) {
            const accessToken = jwt.sign(
                { id: user.id, email: user.email },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '0.5m' }
            );

            const refreshToken = jwt.sign(
                { id: user.id, email: user.email },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1m' }
            );

            // Sending new data
            res.status(200).send({
                accessToken: accessToken,
                refreshToken: refreshToken
            });
            console.log(user) // Displaying user
            console.log("New Access Token:", accessToken);
            console.log("New Refresh Token:", refreshToken);
        }
    });
}


module.exports = {
    register,
    login,
    refreshToken
};