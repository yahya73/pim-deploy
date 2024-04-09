import express from 'express';
import { body } from 'express-validator';
import multer from '../middlewares/multer-config.js';
import {banUser,updateOnce,updateUser, getAll, unbanUser, getusersolde} from '../controllers/UserController.js';




import {createChild,getAllChildren,getAllChildrenByParentId,deleteChildById} from '../controllers/UserController.js'

const router = express.Router();

// Handling routes for the '/tests' endpoint
router.route('/users')
    .get(getAll)

    

.put(updateOnce)
router.route('/user/solde/:username')
.get(getusersolde)
router.route('/users/:id')
    .put(updateUser)
router.route('/users/ban/:id')

    .put(banUser)
router.route('/users/unban/:id')

    .put(unbanUser)
   
// Exporting the router for use in other modules


// Handling routes for the '/tests' endpoint

router.post("/child/add", createChild);

router.get("/child/getallchildren", getAllChildren);
router.get("/child/getallchildrenbyparent/:parentid", getAllChildrenByParentId);
router.delete("/child/deletechildbyid", deleteChildById);

    // Handling GET requests to retrieve all tests
   
// Exporting the router for use in other modules
export default router;
