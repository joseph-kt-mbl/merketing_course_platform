import chargily from "../../config/chargily.js";
import Payment from "./payment.model.js";
import User from "../user/user.model.js";

export const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;

    const payment = await Payment.create({
      userId,
      status: "pending",
    });

    const checkout = await chargily.createCheckout({
      amount: 5000, // price in DZD
      currency: "dzd",

      success_url: "http://localhost:5173/payment-success",
      failure_url: "http://localhost:5173/payment-failed",

      metadata: {
        paymentId: payment._id.toString(),
        userId: userId,
      },
    });

    payment.chargilyPaymentId = checkout.id;
    await payment.save();

    return res.status(200).json({
      checkout_url: checkout.checkout_url,
    });

  } catch (error) {
    console.error("createPayment error:", error);

    return res.status(500).json({
      message: "Failed to create checkout",
    });
  }
};


export const webhook = async (req, res) => {
  try {
    const event = req.body;

    console.log("WEBHOOK EVENT:", event);

    // payment succeeded
    if (event.type === "checkout.paid") {

      const metadata = event.data?.metadata;

      if (!metadata) {
        console.log("Missing metadata in webhook");
        return res.sendStatus(400);
      }

      const { paymentId, userId } = metadata;

      // update payment
      await Payment.findByIdAndUpdate(paymentId, {
        status: "paid",
      });

      // give course access
      await User.findByIdAndUpdate(userId, {
        hasPaid: true,
      });
    }

    return res.sendStatus(200);

  } catch (error) {
    console.error("Webhook error:", error);
    return res.sendStatus(500);
  }
};


export const getStatus = async (req, res) => {
  try {
    const userId = req.user.id
    if(req.user.role === "admin"){
      return res.status(200).json({
        status: "paid"
      });
    }
    
    const payment = await Payment.findOne({ userId });

     if (!payment || !req.user.hasPaid) {
      return res.status(200).json({  // Use 200, not 404
        status: "unpaid",
        hasAccess: false,
        message: "No payment record found. User needs to purchase the course."
      });
    }


    return res.status(200).json({
      status: payment.status
    });
  } catch (error) {
    console.error("getStatus error:", error);
    return res.status(500).json({
      message: "Failed to get payment status"
    });
  }
};