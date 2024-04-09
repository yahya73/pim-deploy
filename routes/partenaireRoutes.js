import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';

const router = express.Router();

import { registerPartenaire, verifyEmail } from '../controllers/partenaireController.js'

router.post('/register', registerPartenaire);
router.get('/verifyEmail/:email', verifyEmail)

export default router;