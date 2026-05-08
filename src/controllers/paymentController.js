const Stripe = require("stripe");

// initialize once (IMPORTANT)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, customerName, phone, tableNumber } = req.body;

    console.log("📦 Incoming items:", items);

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    console.log("💳 Line items:", line_items);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,

      // safer approach
      customer_email: "test@example.com",

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });

    console.log("✅ Stripe Session Created:", session.id);
    console.log("🔗 Stripe URL:", session.url);

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.log("❌ Stripe Error Full:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};