const stripe = require('stripe')(process.env.STRIPE_SK);

export default async function handler(req, res) {
  // Handle both GET and POST requests
  const billingCycle = req.method === 'GET' ? req.query.billingCycle : req.body.billingCycle;

  try {
    // Define your Pro plan prices - using your actual Stripe price IDs
    const prices = {
      monthly: 'price_1RcUmsAc6d0otOaytyonzFQK', // Your actual monthly price ID
      yearly: 'price_1RcV9NAc6d0otOayFVSbcivp'   // Your actual yearly price ID
    };

    // Create Checkout Sessions
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices[billingCycle] || prices.monthly,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/subscribe`,
      metadata: {
        plan: 'pro',
        billing_cycle: billingCycle || 'monthly'
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    });

    if (req.method === 'GET') {
      // Redirect directly to Stripe checkout
      res.redirect(303, session.url);
    } else {
      // Return session ID for POST requests (if needed)
      res.status(200).json({ sessionId: session.id, url: session.url });
    }
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
} 