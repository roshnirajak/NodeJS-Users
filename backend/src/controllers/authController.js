const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const authModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const dotenv = require('dotenv');
dotenv.config();

const userSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(14).required(),
});

const register = async (req, res) => {
    let newAdmin = {};
    const { error, value } = userSchema.validate(req.body);

    if (error) {
        return res.status(200).json({ error: true, message: error.details[0].message });
    }
    const hashedPassword = await bcrypt.hash(value.password, 10);
    const existingAdmin = await authModel.getAdminByEmail(value.email)
    if (existingAdmin[0]) {
        return res.status(200).json({ error: true, message: "Email Already Exists" });
    }
    else {
        newAdmin = {
            uuid: uuidv4(),
            name: value.name,
            email: value.email,
            password: hashedPassword,
        };
        await authModel.registerAdmin(newAdmin)
        return res.status(200).json({ error: false, message: 'Admin created successfully', data: [] });
    }
}


function login(req, res) {
    const email = req.headers.email;
    const password = req.headers.password;

    authModel.loginAdmin(email, password, async (err, user) => {
        if (err) {
            console.error('Error logging in user:', err);
            return res.status(200).json({ error: true, message: 'Internal Server Error' });
        }
        else if (!user) {
            return res.status(200).json({ error: true, message: 'Invalid email or password' });
        }
        const admin = await authModel.getAdminByEmail(user.email);
        const accessToken = jwt.sign(
            { uuid: admin.uuid, email: admin.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '20m' }
        );

        const refreshToken = jwt.sign(
            { uuid: user.uuid, email: user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '30m' }
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
        res.status(200).json({ error: false, message: 'Login successful', 'accessToken': accessToken, 'refreshToken': refreshToken });

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
    const authHeader = req.headers['authorization'];

    let refresh_token = authHeader && authHeader.split(' ')[1];

    if (refresh_token == null) {
        return res.status(402).send({ error: true, message: "Token not found" }); // Token doesn't exist
    }

    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) {
            console.error("Error verifying refresh token:", err);
            return res.status(401).send({ error: true, message: "Refresh token is expired or invalid" }); // Refresh token is expired or invalid
        }

        if (user != undefined) {
            try {
                const admin = await authModel.getAdminByEmail(user.email);

                const accessToken = jwt.sign(
                    { uuid: admin.uuid, email: user.email },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '20m' }
                );

                const refreshToken = jwt.sign(
                    { uuid: admin.uuid, email: user.email },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: '30m' }
                );

                // Sending new data
                res.status(200).send({
                    accessToken: accessToken,
                    refreshToken: refreshToken
                });
            } catch (error) {
                console.error("Error generating new tokens:", error);
                return res.status(500).send({ error: true, message: "Internal Server Error" });
            }
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