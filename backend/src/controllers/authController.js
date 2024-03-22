const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const authModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const dotenv = require('dotenv');
dotenv.config();


function register(req, res) {
    const userSchema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(14).required(),
    });

    const { error, value } = userSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    authModel.getAdminByEmail(value.email)
        .then(existingAdmin => {
            if (existingAdmin) {
                // Admin with this email already exists
                return res.status(409).json({ error: 'Email already exists' });
            }

            bcrypt.hash(value.password, saltRounds, (hashErr, hash) => {
                if (hashErr) {
                    console.error('Error in encryption:', hashErr);
                    return res.status(500).json({ error: 'Error in encryption' });
                }

                const newAdmin = {
                    uuid: uuidv4(),
                    name: value.name,
                    email: value.email,
                    password: hash,
                };

                authModel.registerAdmin(newAdmin, (registerErr, result) => {
                    if (registerErr) {
                        console.error('Error:', registerErr);
                        return res.status(500).json({ error: 'Error creating admin' });
                    }

                    const createdAdmin = {
                        name: newAdmin.name,
                        email: newAdmin.email,
                    };

                    return res.status(200).json({ message: 'Admin created successfully', admin: createdAdmin });
                });
            });
        })
        .catch(err => {
            console.error('Error checking existing admin:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        });
}


// Joi for login input
const loginSchema = Joi.object({
    email: Joi.string().email().required()
    // Password is not included in the schema since it will be retrieved from headers
});

function login(req, res) {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { email } = value;
    const password = req.headers.password; // Retrieve password from headers

    authModel.loginAdmin(email, password, async (err, user) => {
        if (err) {
            console.error('Error logging in user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const admin = await authModel.getAdminByEmail(user.email);
        const accessToken = jwt.sign(
            { uuid: admin.uuid, email: admin.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '5m' }
        );

        const refreshToken = jwt.sign(
            { uuid: user.uuid, email: user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '8m' }
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

const getProfile = async (req, res) => {
    const user = req.body.login_user;

    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    try {
        const admin = await authModel.getAdminByEmail(user.email);
        if (!admin) {
            return res.status(404).json({ error: 'Admin data not found' });
        }
        return res.status(200).json({ user: admin });
    } catch (error) {
        console.error('Error getting admin data:', error);
        return res.status(500).json({ error: 'Failed to get admin data' });
    }
}

async function changePassword(req, res) {
    const email = req.headers.email;
    const oldPassword = req.headers.oldpassword;
    const newPassword = req.headers.newpassword;

    console.log("email", email)

    // Validate newPassword
    const schema = Joi.object({
        newPassword: Joi.string().min(6).required()
    });

    const { error: newPassError, value } = schema.validate({ newPassword });

    if (newPassError) {
        const errorMessage = newPassError.details.map((detail) => detail.message).join(', ');
        return res.status(400).json({ error: errorMessage });
    }

    try {
        // Get admin from database
        const admin = await authModel.getAdminByEmail(email);

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        const passwordMatch = await bcrypt.compare(oldPassword, admin.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = {
            password: hashedPassword,
        };

        authModel.updatePassword(admin.admin_id, updatedUser, (updateErr, result) => {
            if (updateErr) {
                console.error('Error updating password:', updateErr);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.json({ message: 'Password updated successfully' });
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

function refreshToken(req, res) {
    const authHeader = req.headers['authorization']

    let refresh_token = authHeader && authHeader.split(' ')[1];

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
            const admin = await authModel.getAdminByEmail(user.email);
            const accessToken = jwt.sign(
                { uuid: admin.uuid, email: user.email },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '5m' }
            );

            const refreshToken = jwt.sign(
                { uuid: admin.uuid, email: user.email },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '8m' }
            );

            // Sending new data
            res.status(200).send({
                accessToken: accessToken,
                refreshToken: refreshToken
            });
            console.log(user) // Displaying user
            // console.log("New Access Token:", accessToken);
            // console.log("New Refresh Token:", refreshToken);
        }
    });
}


module.exports = {
    register,
    login,
    getProfile,
    changePassword,
    refreshToken
};