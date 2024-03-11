const express = require('express');

const app = express();
app.use(express.json());

// Connection establishing
const connection = require('./conn')

function createUser(newUser, callback) {
    const query = 'INSERT INTO students SET ?';
    connection.query(query, newUser, (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

function getAllUsers(callback) {
    const query = 'SELECT * FROM students WHERE is_active = 1';
    connection.query(query, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function getUserById(userId, callback) {
    const query = 'SELECT * FROM students WHERE student_id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

function updateUserById(userId, updatedUser, callback) {
    const query = 'UPDATE students SET ? WHERE student_id = ?';
    connection.query(query, [updatedUser, userId], (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

function updatePartialUserById(userId, updatedUser, callback) {
    const query = 'UPDATE students SET ? WHERE student_id = ?';
    connection.query(query, [updatedUser, userId], (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

function deleteUserById(userId, callback) {
    const query = 'DELETE FROM students WHERE student_id = ?';
    connection.query(query, [userId], (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

const getNumberOfStudents = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) as totalStudents FROM students';
        connection.query(query, (err, result) => {
            if (err) {
                console.error('Error getting number of students:', err);
                return reject(err);
            }
            const totalStudents = result[0].totalStudents;
            resolve(totalStudents);
        });
    });
};
module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    updatePartialUserById,
    deleteUserById,
    getNumberOfStudents
};