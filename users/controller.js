const User = require('../common/models/User');

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.user.userId },
            attributes: ['id', 'full_name', 'email', 'profile_image_url']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch user profile'
        });
    }
}

const getAllUsersProfiles = async (req, res) => {
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
        console.error('Error fetching all users profiles:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch all users profiles'
        });
    }
}

module.exports = {
    getUserProfile,
    getAllUsersProfiles
}