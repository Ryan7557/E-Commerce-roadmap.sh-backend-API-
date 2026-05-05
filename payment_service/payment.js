const Cart = require('../common/models/Cart');
const Product = require('../common/models/Products');
const Stripe = require('../common/utils/stripe');

const createCheckoutSession = async (req, res) => {
    const userId = req.user.userId;

    try {
        // 1. Fetch all items in the user's cart
        const cartItems = await Cart.findAll({
            where: { user_id: userId }
        });

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                error: 'Your cart is empty. Add some items before checking out!'
            });
        }

        // 2. Fetch product details for each cart item and build line_items
        const line_items = await Promise.all(cartItems.map(async (item) => {
            const product = await Product.findByPk(item.product_id);
            if (!product) return null;

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description
                    },
                    unit_amount: Math.round(parseFloat(product.price) * 100), // Convert to cents
                },
                quantity: item.quantity,
            };
        }));

        // Filter out any nulls (products that might have been deleted)
        const validItems = line_items.filter(item => item !== null);

        if (validItems.length === 0) {
            return res.status(400).json({
                error: 'The products in your cart are no longer available.'
            });
        }

        // 3. Create Stripe session
        const session = await Stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            client_reference_id: userId,
            line_items: validItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        res.send({
            id: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({
            error: 'Failed to create a checkout session',
            details: error.message
        });
    }
};

module.exports = {
    createCheckoutSession
};