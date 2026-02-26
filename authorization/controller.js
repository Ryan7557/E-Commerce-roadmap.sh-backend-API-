const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const User = require('../common/models/User');
const supabase = require('../common/supabase');
const multer = require('multer');
const AppError = require('../common/utils/AppError');

const signupSchema = z.object({
    full_name: z.string().min(3, 'Full name must be at least 3 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});



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
    async (req, res, next) => {
        try {
            const { full_name, email, password } = req.body;

            // Hash password with bcrypt
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Check if a user already exists with the same email
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return next(new AppError('Email already registered.', 400));
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
                    return next(new AppError(`Failed to upload profile photo: ${uploadError.message}`, 400));
                }

                // Get the public URL of the uploaded image
                const { data: publicUrlData } = supabase.storage.from('user-avatars').getPublicUrl(fileName);
                profileImageUrl = publicUrlData.publicUrl
            } else if (req.file && !supabase) {
                console.warn('File upload skipped: Supabase not configured');
            }

            const createNewUser = await User.create({
                full_name,
                email,
                password: hashedPassword,
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
            next(error);
        }
    }
];

const login = [
    async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return next(new AppError('Invalid email or password.', 401));
            }

            const accessToken = generateAccessToken(user.id, user.email);
            res.json({
                success: true,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    profile_image_url: user.profile_image_url
                },
                token: accessToken
            });
        } catch (error) {
            next(error);
        }
    }
]

module.exports = { register, login, signupSchema, loginSchema };