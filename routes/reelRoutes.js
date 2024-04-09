import express from 'express';

import {addReel,updateReel,deleteReel,getAllReels,getReelById,addCommentToReel} from '../controllers/reelController.js';

const router = express.Router();

// Handling routes for the '/tests' endpoint
router.route('/reel')
    .get(getAllReels)
    .post(addReel)


router.route('/reel/:id')

    .delete(deleteReel)
    .get(getReelById)
    .put(updateReel)

router.route('/reel/:id/comment')
    .post(addCommentToReel)

// Exporting the router for use in other modules
export default router;
