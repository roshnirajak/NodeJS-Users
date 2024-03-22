const notificationModel = require('../models/notificationModel');

const getNotificationController = async(req, res) => {
    const user = req.body.login_user;
    
    notificationModel.getNotificationModel( user.email, (err, results) => {
        console.log(user.email)
        if (err) {
            console.error('Error getting notifications:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
}

const getNotificationCount = async(req, res) =>{
    const user = req.body.login_user;
    
    notificationModel.getNotificationCountModel( user.email, (err, results) => {
        console.log(user.email)
        if (err) {
            console.error('Error getting notifications:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
    });
}

module.exports = { getNotificationController, getNotificationCount };
