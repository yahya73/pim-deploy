import express from 'express';
import { body, query } from 'express-validator';
import multer from '../middlewares/multer-config.js';

const router = express.Router();

import { sendMessage, getRoomMessages, getRooms, createRoom } from '../controllers/ChatController.js';

// Route to send a message
router.post('/send', [
    body('username').notEmpty(),
    body('text').notEmpty(),
    body('room_id').notEmpty() // Add room_id validation
], sendMessage);

// Route to get messages for a specific room
router.get('/getRoomMessages', [
    query('room_id').notEmpty(), // Validate room_id in the query string
], getRoomMessages);

// Route to get rooms for a specific user
router.get('/getRooms/:username', getRooms);

// Route to create a new room
router.post('/createRoom', [
    body('buyer_username').notEmpty(),
    body('seller_username').notEmpty()
], createRoom);

export default router;
