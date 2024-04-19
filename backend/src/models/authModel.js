const bcrypt = require('bcrypt');
const express = require('express');
const table = "admin"

const app = express();
app.use(express.json());

// Connection establishing
const knex = require('./conn')

function registerAdmin(newUser) {
  return knex(table).insert(newUser);
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
 return  knex('admin').select().where('email', email)
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
      console.log('Action logged successfully:', result);
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