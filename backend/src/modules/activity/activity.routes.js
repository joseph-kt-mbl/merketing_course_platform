import { Router } from "express";

import { getActivities } from "./activity.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import isAdmin from "../../middlewares/admin.middleware.js";

const router = Router();

router.use(authMiddleware ,isAdmin);
router.get("/", getActivities);

export default router;