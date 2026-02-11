const Product = require('../common/models/Products');
const supabase = require('../common/supabase');
const multer = require('multer');

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
    async (req, res) => {
        try {
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
                    return res.status(400).json({
                        success: false,
                        error: `Failed to upload product image: ${uploadError.message}`
                    });
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
            console.error('Error creating product:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create product'
            });
        }
    }
];

const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: products } = await Product.findAndCountAll({
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
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "No Product Found"
            })
        }
        return res.status(200).json({
            success: true,
            data: product
        })
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch product'
        });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock_quantity } = req.body;
        const { userId } = req.user;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "No Product Found"
            })
        }
        if (product.created_by !== userId) {
            return res.status(403).json({
                success: false,
                error: "You are not authorized to update this product"
            })
        }
        await product.update({
            name,
            description,
            price,
            stock_quantity
        })
        return res.status(200).json({
            success: true,
            data: product
        })
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update product'
        })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "No Product Found"
            })
        }
        if (product.created_by !== userId) {
            return res.status(403).json({
                success: false,
                error: "You are not authorized to delete this product."
            })
        }
        await product.destroy();
        return res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete product'
        })
    }
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};