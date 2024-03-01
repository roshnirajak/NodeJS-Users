const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const express = require('express');

const app = express();
app.use(express.json());


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Users'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});



function registerUser(newUser, callback) {
    const query = 'INSERT INTO Users SET ?';
    connection.query(query, newUser, (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

function loginUser(email, password, callback) {
    const query = "SELECT * FROM `Users` WHERE email = ?";
    connection.query(query, [email], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      if (results.length === 0) {
        // User not found
        return callback(null, null);
      }
  
      // Compare the provided password with the hashed password from the database
      bcrypt.compare(password, results[0].password, (err, passwordMatch) => {
        if (err) {
          return callback(err, null);
        }
        if (!passwordMatch) {
          // Passwords do not match
          return callback(null, null);
        }
        // Passwords match, return the user data
        callback(null, results[0]);
      });
    });
  }

  function createUser(newUser, callback) {
    const query = 'INSERT INTO Users SET ?';
    connection.query(query, newUser, (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

function getAllUsers(callback) {
    const query = 'SELECT * FROM Users';
    connection.query(query, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function getUserById(userId, callback) {
    const query = 'SELECT * FROM Users WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

function updateUserById(userId, updatedUser, callback) {
    const query = 'UPDATE Users SET ? WHERE id = ?';
    connection.query(query, [updatedUser, userId], (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}

function updatePartialUserById(userId, updatedUser, callback) {
    const query = 'UPDATE Users SET ? WHERE id = ?';
    connection.query(query, [updatedUser, userId], (err, result) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, result);
    });
  }

function deleteUserById(userId, callback) {
    const query = 'DELETE FROM Users WHERE id = ?';
    connection.query(query, [userId], (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    });
}
  module.exports = {
    registerUser,
    loginUser,
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    updatePartialUserById,
    deleteUserById
  };