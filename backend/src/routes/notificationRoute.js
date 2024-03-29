const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/jwt');

// Routes for users
router.get('/get-notification', auth, notificationController.getNotificationController);
router.get('/get-notification-count', auth, notificationController.getNotificationCount);
router.put('/mark-as-seen', auth, notificationController.markNotificationsAsSeen);
router.put('/clear', auth, notificationController.clearNotifications);


module.exports = router;