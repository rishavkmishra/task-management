import express from "express";


const router= express.Router();
import {register, login, updated} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";



router.post("/register", register);
router.post("/login", login);
router.patch("/update",authMiddleware ,updated);


export default router;
