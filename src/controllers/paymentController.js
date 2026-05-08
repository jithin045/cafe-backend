const Stripe = require("stripe");

// initialize once
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, customerName, phone } = req.body;

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,

      // 🔥 INDIA COMPLIANCE FIX
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["IN"],
      },

      // optional but useful
      customer_email: "customer@example.com",

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });

    console.log("✅ Stripe session created:", session.id);

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.log("❌ Stripe Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};