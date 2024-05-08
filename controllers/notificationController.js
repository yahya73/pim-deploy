import Notification from '../models/notification.js';
import admin from 'firebase-admin';
import User from '../models/User.js';
admin.initializeApp({
    credential: admin.credential.cert('./firebase-admin-config.json'), // Provide the path to your service account key JSON file
  });

const db = admin.firestore();
export async function sendNotificationReact(notification, iduser) {
  try {
    // Find the user by iduser
    const user = await User.findById(iduser);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const tokens = user.fcmtokens;
    await Promise.all(tokens.map(async (token) => {
      await admin.messaging().send({
        token: token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
      });
    }));

    // Add notification to database
    await db.collection('notificationsReact').add({
      title: notification.title,
      body: notification.body,
      iduser: iduser,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Failed to send notification');
  }
}

export async function getNotificationsByUserId(iduser) {
  try {
    const snapshot = await db
      .collection('notificationsReact')
      .where('iduser', '==', iduser)
      .orderBy('timestamp', 'desc') // Optionally, order by timestamp descending
      .get();

    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw new Error('Failed to get notifications');
  }
}

export async function sendPaymentNotification(tokens, products, sellerId, amount) {
  try {
    const productNames = products.map(product => product.productName);

    // Send the notification to each device
    await Promise.all(tokens.map(async (token) => {
      await admin.messaging().send({
        data: {
          title: 'Confirm Your Payment',
          body: `You have a pending payment to confirm for ${productNames.join(', ')} amounting to $${amount.toFixed(2)}`,
          action: 'confirm_payment',
          products: JSON.stringify(products),
          sellerId: sellerId,
          amount: amount.toString(),
        },
        token: token,
      });
    }));

    console.log("Payment notification sent.");
   
  } catch (err) {
    console.log(err);
    throw new Error('Failed to send payment notification');
  }
}


export async function sendNotification(message, tokens) {
  try {
    // Send the notification to each device
    await Promise.all(tokens.map(async (token) => {
      await admin.messaging().send({
        data: {
          title: message.title,
          body: message.body,
          action: 'default_notification',

        },
        token: token,
       
      });
    }));

    console.log("Notification sent:", message);
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

export async function createNotification(req, res) {
  const notification = req.body;
  try {
    const notification2 = new Notification(notification);
    const savedNotification = await notification2.save();

    // Retrieve FCM tokens associated with the user
    const user = await User.findById(savedNotification.recipientId);
    const tokens = user.fcmtokens || [];

    const message = {
      title: savedNotification.type,
      body: savedNotification.content,
    };
    await sendNotification(message, tokens);

    res.status(201).json(savedNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: error.message });
  }
}


  // Get notifications for a user
 export async function getNotifications(req, res) {
  const userId = req.params.id;
  const fcmToken = req.query.fcmToken;
console.log(fcmToken);

  try {
    const notifications = await Notification.find({ recipientId: userId }).sort({ createdAt: -1 });
    // Store FCM token in session
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
