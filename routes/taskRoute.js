


import express from "express";

//import { createTask, searchTask, getPaginatedTask,markTaskDone  } from "../controllers/taskcontroller.js";

//import { createTask, searchTask, getTasks, markTaskDone } from "../controllers/taskController.js";
import { createTask, searchTask, getTasks, markTaskDone } from "../controllers/taskcontroller.js";


import authMiddleware from "../middleware/authMiddleware.js";
import { updated } from "../controllers/authController.js";

const router = express.Router();
router.use(authMiddleware)
router.post("/create", createTask);
router.get("/search", searchTask);
//router.get("/pagination" getPaginatedTask);
router.patch("/update/:id", markTaskDone);
router.patch("/update", updated);
router.get("/heavily-protected", (req, res) => res.json({ message: "this is a secret" }))


router.get('/sp', getTasks);


export default router;
