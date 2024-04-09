import express from 'express';
import { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../controllers/ProductController.js';

const router = express.Router();

// Routes for products
router.post('/add', addProduct);
router.get('/:sellerId', getAllProducts);
router.get('/detail/:id', getProductById);
router.put('/edit/:id', updateProduct);
router.delete('/delete/:id', deleteProduct);

export default router;
