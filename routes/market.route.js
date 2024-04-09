import {
	createMarket,
	getAllMarkets,
} from '../controllers/MarketController.js';
import express from 'express';

const router = express.Router();

router.post('/market', createMarket);

router.get('/market', getAllMarkets);

export default router;
