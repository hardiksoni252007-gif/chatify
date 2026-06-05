import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth.controler.js";
import { protectRoute } from "../middleware/auth.middleware.js";

let router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, (res,req) => res.status(200).json(req.user));

export default router;