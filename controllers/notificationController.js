import Notification from '../models/notification.js';
import admin from 'firebase-admin';
admin.initializeApp({
    credential: admin.credential.cert('./firebase-admin-config.json'), // Provide the path to your service account key JSON file
  });

global.tokendevice  
const db = admin.firestore();
export async function sendNotification(message, token) {
  try {
      // Send the notification
      await admin.messaging().send({
          notification: {
              title: message.title,
              body: message.body,
          },
          token: token,
      });
   console.log("notification",message);
      await db.collection('notifications').add({
          title: message.title,
          body: message.body,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
  } catch (err) {
      console.log(err);
      throw new Error('Failed to send notification');
  }
}
  export  async function createNotification(req, res) {
    const notification = req.body;
    try {
      const notification2 = new Notification(
       notification);
      const savedNotification = await notification2.save();
      const message = {
        title: savedNotification.type,
        body: savedNotification.content,
    };
    const token = global.tokendevice;
    await sendNotification(message, token);
      res.status(201).json(savedNotification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  // Get notifications for a user
 export async function getNotifications(req, res) {
  const userId = req.params.id;
  const fcmToken = req.query.fcmToken;
  req.session.fcmToken = fcmToken; 
  global.tokendevice = fcmToken;

  try {
    const notifications = await Notification.find({ recipientId: userId }).sort({ createdAt: -1 });
    // Store FCM token in session
    console.log(req.session.fcmToken);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
}

  
  export async function markNotificationAsRead(req, res) {
    const notificationId = req.params.id;
    

    try {
      const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
      
      );
      res.status(200).json(updatedNotification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: error.message });
      throw new Error('Failed to mark notification as read');
    
      
    }
  }

  // Delete a notification
  export async function deleteNotification(req, res) {
    const notificationId = req.params.id;
    try {
      const deletedNotification = await Notification.findByIdAndDelete(notificationId);
      res.status(200).json(deleteNotification);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
