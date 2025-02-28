import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js';
import { createNewCoupon, getCoupon, validateCoupon} from '../controllers/coupon.controller.js';

const router = express.Router();

router.get("/", protectRoute, getCoupon);
router.post("/validate", protectRoute, validateCoupon);
router.post("/create", protectRoute, createNewCoupon);


export default router;