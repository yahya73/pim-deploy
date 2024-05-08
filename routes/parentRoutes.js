import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';

const router = express.Router();

import { registerParent, createNFTWithNfcTag, getAccountDetails, verifyEmail, getChildTransactionHistory, forgetKeys, updateFirstTime } from '../controllers/parentController.js'

router.post('/register', registerParent);
router.get('/blockchainAccount', getAccountDetails);
router.get('/verifyEmail/:email', verifyEmail)

//get child's transactions 
router.get('/transactions/child/:parentId', getChildTransactionHistory);

router.post('/newPhrase', forgetKeys);
router.put('/updateFirstTime/:userId', updateFirstTime);
router.post('/createNFTWithNfcTag', createNFTWithNfcTag)


export default router;