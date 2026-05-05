const Product = require('../common/models/Products');
const supabase = require('../common/supabase');
const multer = require('multer');
const { z } = require('zod');
const { Op } = require('sequelize');
const AppError = require('../common/utils/AppError');

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().min(1, 'Product description is required'),
    price: z.coerce.number().positive('Price must be a positive number'),
    stock_quantity: z.coerce.number().int().min(0, 'Stock quantity cannot be negative')
});


// Configure multer for product image uploads
const imageUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const createProduct = [
    imageUpload.single('productImage'),
    async (req, res, next) => {
        try {
            // Data is already validated and coerced by middleware
            const { name, description, price, stock_quantity } = req.body;
            const userId = req.user.userId;

            let imageUrl = null;
            let imageFilename = null;

            // Handle product image upload to Supabase if provided
            if (req.file && supabase) {
                imageFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
                const extension = req.file.mimetype.split('/')[1];
                const fileName = `${imageFilename}.${extension}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, req.file.buffer, {
                        contentType: req.file.mimetype,
                        upsert: false
                    });

                if (uploadError) {
                    return next(new AppError(`Failed to upload product image: ${uploadError.message}`, 400));
                }

                // Get the public URL of the uploaded image
                const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
                imageUrl = publicUrlData.publicUrl;
            } else if (req.file && !supabase) {
                console.warn('File upload skipped: Supabase not configured');
            }

            const newProduct = await Product.create({
                name,
                description,
                price,
                stock_quantity,
                created_by: userId,
                image_url: imageUrl,
                image_filename: imageFilename
            });

            return res.status(201).json({
                success: true,
                data: newProduct
            });
        } catch (error) {
            next(error);
        }
    }
];

const getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: products } = await Product.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                totalItems: count,
                totalPages,
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) {
            return next(new AppError("No Product Found", 404));
        }
        return res.status(200).json({
            success: true,
            data: product
        })
    } catch (error) {
        next(error);
    }
}

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const product = await Product.findByPk(id);
        if (!product) {
            return next(new AppError("No Product Found", 404));
        }
        if (product.created_by !== userId) {
            return next(new AppError("You are not authorized to update this product", 403));
        }

        // Data is already partially validated and coerced by middleware
        await product.update(req.body);
        return res.status(200).json({
            success: true,
            data: product
        })
    } catch (error) {
        next(error);
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const product = await Product.findByPk(id);
        if (!product) {
            return next(new AppError("No Product Found", 404));
        }
        if (product.created_by !== userId) {
            return next(new AppError("You are not authorized to delete this product.", 403));
        }

        // Fix: Delete references in carts first to avoid Foreign Key Constraint Error
        const Cart = require('../common/models/Cart');
        await Cart.destroy({ where: { product_id: id } });

        await product.destroy();
        return res.status(200).json({
            success: true,
            message: "Product and related cart items deleted successfully",
            data: product
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    productSchema
};