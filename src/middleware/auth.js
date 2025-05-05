const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.header('Authorization');
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        // Remove Bearer if present
        token = token.replace(/^Bearer\s+/, '');

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const admin = await Admin.findById(decoded.id);

            if (!admin) {
                return res.status(401).json({ success: false, message: 'Invalid token' });
            }

            req.admin = admin;
            req.token = token;
            next();
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Token verification failed' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = authMiddleware;