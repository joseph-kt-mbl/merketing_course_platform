// Route definitions

import express from 'express';
import * as userController from './user.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import redis from '../../config/redis.js';

const router = express.Router();


router.post('/register', userController.register);
router.post('/login',userController.login)
router.get('/refresh',userController.refresh)
router.post('/logout',userController.logout)
// POST /auth/request-otp
router.post('/request-otp', userController.requestOtp)
router.get('/validate-otp', userController.validateOtp)



router.post('/send-url',userController.sendUrl)

router.get("/profile", authMiddleware ,userController.profile);


router.get("/verify",userController.verify);
router.get("/check-email", userController.checkEmailExistence);




// GET /api/users
router.get('/', userController.getStudents);

export default router;