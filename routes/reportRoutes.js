import express from 'express';

import {createReport,getAllReports,getReportById,deleteReportById} from '../controllers/reportController.js';

const router = express.Router();

// Handling routes for the '/tests' endpoint
router.route('/reports')
    .get(getAllReports)
    .post(createReport)


router.route('/reports/:id')

    .delete(deleteReportById)
    .get(getReportById)
export default router;
