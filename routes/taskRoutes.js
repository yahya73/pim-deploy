import express from 'express';
import { body, query } from 'express-validator';
import multer from '../middlewares/multer-config.js';
import {
    addTask,
    updateTask,
    getAllTasks,
    getOngoingTasks,
    getFinishedTasks,
    deleteTask,
    activateAi,
    getKids
  } from '../controllers/taskController.js';

const router = express.Router();

router.post("/add", addTask)
router.post("/activateAi", activateAi);
router.put("/update/:id", updateTask)
router.post("/getKids", getKids)
router.get('/allTasks', getAllTasks);
router.get('/ongoing', getOngoingTasks);
router.get('/finished', getFinishedTasks);
router.delete('/delete/:id', deleteTask);

export default router;
