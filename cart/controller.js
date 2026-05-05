const Cart = require('../common/models/Cart');
const Product = require('../common/models/Products');
const asyncHandler = require('express-async-handler');
const AppError = require('../common/utils/AppError');

// @desc    Add items to cart
// @route   POST /cart/add
// @access  Private

const addToCart = asyncHandler(async (req, res, next) => {
    const { product_id, quantity } = req.body;
    const userId = req.user.userId;

    // Check for valid input
    if (!product_id || !quantity || quantity <= 0) {
        return next(new AppError('Invalid product ID or quantity', 400));
    }
    
    // Find product by ID and check if it exists and is active 
    const product = await Product.findByPk(product_id);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    if (!product.is_active) {
        return next(new AppError('Product is currently inactive', 400));
    }

    // check if product already exists in cart 
    const cartItem = await Cart.findOne({
        where: {
            user_id: userId,
            product_id: product_id
        }
    });

    // If product already exists in cart, check stock, update quantity and send response
    if (cartItem) {
        if (product.stock_quantity < cartItem.quantity + quantity) {
            return next(new AppError('Not enough stock available', 400));
        }

        cartItem.quantity += quantity;
        await cartItem.save();
        res.status(200).json({
            message: 'Quantity updated in cart'
        });
        return;
    }

    // Otherwise if product does not exist in cart, check stock, create new cart item
    if (product.stock_quantity < quantity) {
        return next(new AppError('Not enough stock available', 400));
    }

    await Cart.create({
        user_id: userId,
        product_id: product_id,
        quantity: quantity
    });
    res.status(201).json({
        message: 'Product added to cart successfully'
    });
});

// @desc    delete/remove items from cart
// @route   DELETE /cart/:id
// @access  Private
const removeFromCart = asyncHandler(async(req, res, next) => {
    const userId = req.user.userId;
    const { id } = req.params;

    // find the cart item
    const cartItem = await Cart.findOne({
        where: {
            id: id,
            user_id: userId
        }
    });
     
    // Check if item exists and user owns it 
    if (!cartItem) {
        return next(new AppError('Cart item not found', 404));
    }

    await cartItem.destroy();
    res.status(204).json({
        message: 'Item removed from cart successfully'
    });
})

module.exports = {
    addToCart, 
    removeFromCart
};