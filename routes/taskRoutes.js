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
  } from '../controllers/taskController.js';
const router = express.Router();

router.post("/add", addTask)
router.patch("/update/:id", updateTask)
router.get('/allTasks', getAllTasks);
// Route to get all ongoing tasks for a parent by username
router.get('/ongoing', getOngoingTasks);
// Route to get all finished tasks for a parent by username
router.get('/finished', getFinishedTasks);
// Route to delete a task
router.delete('/delete/:id', deleteTask);

export default router;