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
        const products = await Product.findAll();
        return res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
}

module.exports = {
    createProduct,
    getAllProducts,
};