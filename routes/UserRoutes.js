import express from 'express';
import {signin,sendPasswordResetEmail,resetPassword } from '../controllers/UserController.js';

const router = express.Router(); 

router
    .route('/signin')
    .post(signin)
 
router
    .route('/forgot-password')
    .post(sendPasswordResetEmail)
router
    .route('/update-password')
    .post(resetPassword)


export default router ;