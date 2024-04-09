import express from 'express';
import { getAllProducts,getAllProductswhished,addWishedProduct,deleteWishedProduct,updateWishedProduct,getWhishedProductById ,getAllProductsdetails} from '../controllers/wishlistController.js'

const router = express.Router();

router.post('/add', addWishedProduct);
router.get('/products',getAllProducts);
router.get('/allProducts/:childId',getAllProductsdetails)
router.put('/edit/:childId/:productId', updateWishedProduct);
router.delete('/delete/:childId/:productId', deleteWishedProduct);
router.get('/:childId', getAllProductswhished);
router.get('/:childId/:productId',getWhishedProductById);
export default router;