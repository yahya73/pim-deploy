import {payment,verifyPayment,success, transfertochild} from "../controllers/Payment.js";
import express from "express";

const router = express.Router();
router.route("/payment")
.post(payment)
router.route("/verifyPayment/:paymentId")
    .post(verifyPayment)
router.route("/payment/success/:amount/:userid")
    .get(success)
    router.route("/payment/transfertochild")
.post(transfertochild)
export default router;
