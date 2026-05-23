const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const auth = require("../middleware/auth");

// CREATE PAYMENT INTENT
router.post("/create-payment-intent", auth, async (req, res) => {
  const { amount } = req.body;

  if (!amount)
    return res.status(400).json({ message: "Amount is required" });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;