import express from 'express';

import {addOnce,getOneById,getAll, deleteProduct} from '../controllers/ProductController.js';

const router = express.Router();

// Handling routes for the '/tests' endpoint
router.route('/product')
    .get(getAll)
    .post(addOnce)


router.route('/product/:id')

    .delete(deleteProduct)
    .get(getOneById)

// Exporting the router for use in other modules
export default router;
