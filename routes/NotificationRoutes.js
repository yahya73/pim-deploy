import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';
import {paymentnotification} from '../controllers/UserController.js'
 


import {createNotification,deleteNotification,getNotifications,markNotificationAsRead,sendNotificationReact,getNotificationsByUserId} from '../controllers/notificationController.js'

const router = express.Router();

router.get('/notifications-react/:iduser', async (req, res) => {
    const { iduser } = req.params;
    try {
        const notifications = await getNotificationsByUserId(iduser);
        res.json(notifications);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ message: 'Failed to get notifications' });
    }
});

router.route('/notifications/:id')
    .get(getNotifications);

router.route('/notifications/read/:id')
    .put(markNotificationAsRead);

router.post("/notifications/add", createNotification);

router.delete("/notifications/delete/:id", deleteNotification);

// Route for sending notifications
router.post('/send-notification-react', async (req, res) => {
    try {
        const { notification, iduser } = req.body;

        // Call sendNotificationReact function
        await sendNotificationReact(notification, iduser);

        res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});
router.post("/notifications/pay", paymentnotification);

export default router;