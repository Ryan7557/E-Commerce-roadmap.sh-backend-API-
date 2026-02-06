const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const User = require('../common/models/User');
const supabase = require('../common/supabase');
const multer = require('multer');

const ajv = new Ajv();
addFormats(ajv);

const schema = {
    type: 'object',
    required: ['full_name', 'email', 'password'],
    properties: {
        full_name: { type: 'string', minLength: 3 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 }
    }
};

const validate = ajv.compile(schema);

// Helper function to hash passwords
const encryptPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

// SECRET key for JWT (in production, use a secure method to store this)
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Helper function to generate JWT
const generateAccessToken = (userId, email) =>
    jwt.sign({ userId, email }, SECRET_KEY, { expiresIn: '7d' });

// configure multer for image uploads
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

const register = [
    imageUpload.single('profileImage'),
    async (req, res) => {
        try {
            if (!validate(req.body)) {
                return res.status(400).json({ error: 'Invalid Input', details: validate.errors });
            }

            const { full_name, email, password } = req.body;
            const encryptedPassword = encryptPassword(password);

            // Check if a user already exists with the same email
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Email already registered.'
                });
            }

            let profileImageUrl = null;
            let imageFilename = null;

            // Handle profile image upload to Supabase if provided
            if (req.file && supabase) {
                imageFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
                const extension = req.file.mimetype.split('/')[1];
                const fileName = `${imageFilename}.${extension}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('user-avatars')
                    .upload(fileName, req.file.buffer, {
                        contentType: req.file.mimetype,
                        upsert: false
                    });

                if (uploadError) {
                    return res.status(400).json({
                        success: false,
                        error: `Failed to upload profile photo: ${uploadError.message}`
                    });
                }

                // Get the public URL of the uploaded image
                const { data: publicUrlData } = supabase.storage.from('user-avatars').getPublicUrl(fileName);
                profileImageUrl = publicUrlData.publicUrl
            } else if (req.file && !supabase) {
                console.warn('File upload skipped: Supabase not configured');
            }

            // Create a new user record in the database
            const createNewUser = await User.create({
                full_name,
                email,
                password: encryptedPassword,
                profile_image_url: profileImageUrl,
                image_filename: imageFilename
            });

            const accessToken = generateAccessToken(createNewUser.id, createNewUser.email);
            res.status(201).json({
                success: true,
                user: {
                    id: createNewUser.id,
                    full_name: createNewUser.full_name,
                    email: createNewUser.email,
                    profile_image_url: createNewUser.profile_image_url
                },
                token: accessToken
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
];

module.exports = { register };