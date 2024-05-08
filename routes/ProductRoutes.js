import express from 'express';

import {addOnce,getOneById,getAll, deleteProduct, getAllProductTypes,readnfc} from '../controllers/ProductController.js';

const router = express.Router();

// Handling routes for the '/tests' endpoint
router.route('/product')
    .get(getAll)
    .post(addOnce)

router.route('/getTypes').get(getAllProductTypes)

router.route('/product/:id')

    .delete(deleteProduct)
    .get(getOneById)
router.route('/product/nfc')
.post(readnfc)

// Exporting the router for use in other modules
export default router;
