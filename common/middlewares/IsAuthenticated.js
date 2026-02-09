const jwt = require('jsonwebtoken');

const checkAuthentication = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: 'No authorization header provided.'
        });
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
        return res.status(401).json({
            success: false,
            error: 'Invalid Authentication token'
        })
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            error: 'Invalid Authentication token'
        })
    }
}

module.exports = checkAuthentication;