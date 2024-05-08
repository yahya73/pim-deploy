import Identifiers from '../models/identifiers.js';

// Controller function to add a new identifier
export const addIdentifier = async (req, res) => {
  try {
    const { nfc_id, nft_id } = req.body;
    const newIdentifier = new Identifiers({ nfc_id, nft_id });
    const savedIdentifier = await newIdentifier.save();
    res.status(201).json(savedIdentifier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to get an identifier by NFC ID
export const getByIdentifierByNFC = async (req, res) => {
  try {
    const { nfc_id } = req.params;
    const identifier = await Identifiers.findOne({ nfc_id });
    if (!identifier) {
      return res.status(404).json({ message: 'Identifier not found' });
    }
    res.json(identifier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to get an identifier by NFT token
export const getByIdentifierByToken = async (req, res) => {
  try {
    const { nft_id } = req.params;
    const identifier = await Identifiers.findOne({ nft_id });
    if (!identifier) {
      return res.status(404).json({ message: 'Identifier not found' });
    }
    res.json(identifier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
