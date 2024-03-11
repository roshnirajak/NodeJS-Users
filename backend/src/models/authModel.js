const bcrypt = require('bcrypt');
const express = require('express');

const app = express();
app.use(express.json());

// Connection establishing
const connection = require('./conn')

function registerAdmin(newUser, callback) {
  const query = 'INSERT INTO `admin` SET ?';
  connection.query(query, newUser, (err, result) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, result);
  });
}

function loginAdmin(email, password, callback) {
  const query = "SELECT * FROM `admin` WHERE email = ?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      //User not found
      return callback(null, null);
    }

    bcrypt.compare(password, results[0].password, (err, passwordMatch) => {
      if (err) {
        return callback(err, null);
      }
      if (!passwordMatch) {
        //Passwords don't match
        return callback(null, null);
      }
      //Passwords match, return the user data
      callback(null, results[0]);
    });
  });
}

function getAdminByEmail(email) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM admin WHERE email = ?';
    connection.query(query, [email], (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length === 0) {
        return resolve(null);
      }
      const admin = result[0];
      resolve(admin);
    });
  });
}

function updatePassword(userId, updatedUser, callback) {
  const { password } = updatedUser;

  const query = 'UPDATE admin SET password = ? WHERE admin_id = ?';
  connection.query(query, [password, userId], (updateErr, result) => {
    if (updateErr) {
      callback(updateErr, null);
      return;
    }
    callback(null, result);
  });
}
const createAdminLog = (user_id, admin_id, action) => {
  const query = 'INSERT INTO admin_log (user_id, admin_id, action) VALUES (?, ?, ?, ?)';
  connection.query(query, [user_id, admin_id, action], (err, result) => {
    if (err) {
      console.error('Error logging product action:', err);
    } else {
      console.log('Product action logged successfully:', result);
    }
  });
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminByEmail,
  updatePassword,
  createAdminLog,
}