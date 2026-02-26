const User = require('../common/models/User');
const AppError = require('../common/utils/AppError');

const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.userId },
            attributes: ['id', 'full_name', 'email', 'profile_image_url']
        });

        if (!user) {
            return next(new AppError('User not found', 404));
        }
        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
}

const getAllUsersProfiles = async (req, res, next) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'full_name', 'email',
                'profile_image_url', 'created_at'
            ],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUserProfile,
    getAllUsersProfiles
}