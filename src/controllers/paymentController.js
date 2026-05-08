const Stripe = require("stripe");

exports.createCheckoutSession = async (req, res) => {
  try {
    const { items, customerName, phone, tableNumber } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

      // ✅ REQUIRED FOR INDIA EXPORT RULE
      customer_email: "test@example.com",

      shipping_address_collection: {
        allowed_countries: ["IN"],
      },

      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "inr",
            },
            display_name: "Delivery",
          },
        },
      ],

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.log("Stripe Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};