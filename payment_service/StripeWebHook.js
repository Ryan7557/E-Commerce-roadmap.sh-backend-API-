const Stripe = require('../common/utils/stripe');
const Cart = require('../common/models/Cart');

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Stripe requires the raw body for signature verification
        event = Stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log(`Payment was successful for session ID: ${session.id}`);
            
            const userId = session.client_reference_id;
            if (userId) {
                try {
                    await Cart.destroy({ where: { user_id: userId } });
                    console.log(`Cart emptied successfully for user: ${userId}`);
                } catch (error) {
                    console.error(`Failed to empty cart for user ${userId}:`, error);
                }
            } else {
                console.warn('No client_reference_id found in session. Cart not emptied.');
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

module.exports = handleStripeWebhook;