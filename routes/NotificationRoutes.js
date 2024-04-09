import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';



import {createNotification,deleteNotification,getNotifications,markNotificationAsRead} from '../controllers/notificationController.js'

const router = express.Router();

// Handling routes for the '/tests' endpoint
router.route('/notifications/:id')
    .get(getNotifications)


router.route('/notifications/read/:id')

    .put(markNotificationAsRead)

   
// Exporting the router for use in other modules


// Handling routes for the '/tests' endpoint

router.post("/notifications/add", createNotification);


router.delete("/notifications/delete/:id", deleteNotification);

    // Handling GET requests to retrieve all tests
   
// Exporting the router for use in other modules
export default router;
