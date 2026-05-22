import express from "express";
import {
  createPayment,
  webhook,
  getStatus
} from "./payment.controller.js";

import protect from "./../../middlewares/auth.middleware.js"

const router = express.Router();


router.get('/status',protect , getStatus);


router.post("/create", protect,createPayment);
// ⚠️ webhook MUST get raw body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhook
);


export default router;

