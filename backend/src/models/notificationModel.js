const express = require('express');
const authModel= require('./authModel')

const app = express();
app.use(express.json());

// Connection establishing
const connection = require('./conn')

function addNotification(admin_id, student_id, action, callback) {
    const query = 'INSERT INTO notifications (admin_id, student_id, action) VALUES (?, ?, ?)';
    connection.query(query, [admin_id, student_id, action], (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, result); // Pass the inserted notification_id back
    });
}

const getNotificationModel = async (admin_email, callback) => {
    try {
        const admin = await authModel.getAdminByEmail(admin_email);
        if (!admin) {
            throw new Error('Admin data not found');
        }

        const query = `
        SELECT n.notification_id, n.admin_id, n.student_id, s.name, n.action, n.created_at
        FROM notifications AS n
        JOIN students AS s ON n.student_id = s.student_id
        WHERE n.admin_id = ${admin.admin_id}
        ORDER BY n.created_at DESC
      `;
        connection.query(query, (err, results) => {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, results);
        });
    } catch (error) {
        callback(error, null);
    }
};

const getNotificationCountModel = async(admin_email, callback) =>{
    try {
        const admin = await authModel.getAdminByEmail(admin_email);
        if (!admin) {
            throw new Error('Admin data not found');
        }
        
        const countQuery = `
        SELECT COUNT(*) AS totalCount FROM notifications 
        WHERE admin_id = ${admin.admin_id} AND is_seen=0`;

        connection.query(countQuery, (err, results) => {
            if (err) {
                callback(err, null);
                return;
            }
            const totalCount = results[0].totalCount;
            console.log(totalCount)
            callback(null, totalCount);
        });
    } catch (error) {
        callback(error, null);
    }
}

module.exports = { addNotification, getNotificationModel, getNotificationCountModel };
