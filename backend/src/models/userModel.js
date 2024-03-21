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

function getAllUsers(pageNumber, usersPerPage, callback) {
    const offset = (pageNumber - 1) * usersPerPage;
    const query = `
        SELECT s.*, c.course_name 
        FROM students s
        LEFT JOIN course c ON s.course_id = c.course_id
        WHERE s.is_active = 1 
        ORDER BY s.created_at DESC
        LIMIT ${usersPerPage} OFFSET ${offset}
    `;

    const countQuery = `SELECT COUNT(*) AS totalCount FROM students WHERE is_active = 1`;

    connection.query(query, (err, results) => {
        if (err) {
            callback(err, null, 0);
            return;
        }

        connection.query(countQuery, (countErr, countResult) => {
            if (countErr) {
                callback(countErr, null, 0);
                return;
            }

            const totalCount = countResult[0].totalCount;
            callback(null, results, totalCount);
        });
    });

}


function getUsersWithSearch(searchTerm, courseId, pageNumber, usersPerPage, callback) {
    const offset = (pageNumber - 1) * usersPerPage;
    let query = `
        SELECT s.*, c.course_name
        FROM students s
        LEFT JOIN course c ON s.course_id = c.course_id
        WHERE s.is_active = 1`;

    let countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM students s
        LEFT JOIN course c ON s.course_id = c.course_id
        WHERE s.is_active = 1`;

    if (searchTerm) {
        query += ` AND (s.name LIKE '%${searchTerm}%' OR s.email LIKE '%${searchTerm}%')`;
        countQuery += ` AND (s.name LIKE '%${searchTerm}%' OR s.email LIKE '%${searchTerm}%')`;
    }

    if (courseId) {
        query += ` AND s.course_id = '${courseId}'`;
        countQuery += ` AND s.course_id = '${courseId}'`;
    }

    query += ` ORDER BY s.created_at DESC LIMIT ${usersPerPage} OFFSET ${offset}`;

    connection.query(query, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }

        connection.query(countQuery, (countErr, countResult) => {
            if (countErr) {
                callback(countErr, null, 0);
                return;
            }
            const totalCount = countResult[0].totalCount;
            callback(null, results, totalCount);
        });
    });
}

function countAllUsers(callback) {
    const query = 'SELECT COUNT(*) AS total FROM students WHERE';
    connection.query(query, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        const totalCount = results[0].total;
        callback(null, totalCount);
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
    getUsersWithSearch,
    countAllUsers,
    getUserById,
    updateUserById,
    updatePartialUserById,
    deleteUserById,
    getNumberOfStudents
};