const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const defineUser = require('../common/models/User');
const sequelize = require('../common/database');
const { createClient } = require('@supabase/supabase-js');
const User = defineUser(sequelize);
const multer = require('multer');

const supabaseInit = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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