import Market from '../models/market.js';
export async function createMarket(req, res) {
	try {
		const { name, lat, lng } = req.body;
		const newMarket = new Market({
			name,
			lat,
			lng,
		});
		const savedMarket = await newMarket.save();
		res.status(201).json(savedMarket);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export async function getAllMarkets(req, res) {
	try {
		const markets = await Market.find();
		res.status(200).json(markets);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}
