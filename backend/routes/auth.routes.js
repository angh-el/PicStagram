import express from "express";
import {signup} from "../controllers/auth.constrollers.js";
import {login} from "../controllers/auth.constrollers.js";
import {logout} from "../controllers/auth.constrollers.js";
import { protectRoute } from "../middleware/protectRoute.js";
import {getMe} from "../controllers/auth.constrollers.js";


const router = express.Router();

router.get("/me", protectRoute, getMe)

router.post("/signup", signup)

router.post("/login", login)

router.post("/logout", logout)


export default router;