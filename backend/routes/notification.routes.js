import express from "express";
import {protectRoute} from "../middleware/protectRoute.js";
import {getNotifications, deleteNotifications, deleteNotification} from "../controllers/notifications.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.delete("/", protectRoute, deleteNotifications);
router.patch("/:id", protectRoute, deleteNotification);

export default router;