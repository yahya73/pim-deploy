import express from 'express';
import {signin,sendPasswordResetEmail,resetPassword,resetPasswordFirsttime, createchildinblockchain } from '../controllers/UserController.js';
import {loginwithsecretkey} from '../controllers/parentController.js';

const router = express.Router(); 

router
    .route('/signin')
    .post(signin)
router .route('/signinwithsecret').post(loginwithsecretkey)
router
    .route('/forgot-password')
    .post(sendPasswordResetEmail)
router
    .route('/update-password')
    .post(resetPassword)
    router
    .route('/resetfirsttime')
    .post(resetPasswordFirsttime)

export default router ;