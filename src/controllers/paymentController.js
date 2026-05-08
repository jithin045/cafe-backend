const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, customerName, phone } = req.body;

    if (!items?.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
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

      billing_address_collection: "required",

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.log("Stripe Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};