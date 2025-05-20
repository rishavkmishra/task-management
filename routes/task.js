


import express from "express";

//import { createTask, searchTask, getPaginatedTask,markTaskDone  } from "../controllers/taskcontroller.js";
import { createTask, searchTask, getTasks } from "../controllers/taskcontroller.js";
import authMiddleware from "../middleware/auth.js";

const router= express.Router();

router.post("/create", authMiddleware, createTask);
router.get("/search",authMiddleware, searchTask);
//router.get("/pagination",authMiddleware, getPaginatedTask);
//router.patch("/update/:id",authMiddleware, markTaskDone);

router.get('/sp', authMiddleware, getTasks);


export default router;
