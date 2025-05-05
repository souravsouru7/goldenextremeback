const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const { validateLogin, validatePassword, validateEmail } = require('../utils/validation');

class AuthController {
    async register(req, res) {
        try {
            const { username, password, email } = req.body;

            if (!validatePassword(password) || !validateEmail(email)) {
                return res.status(400).json({ message: 'Invalid credentials format' });
            }

            const existingAdmin = await Admin.findOne({ 
                $or: [{ email }, { username }] 
            });

            if (existingAdmin) {
                return res.status(400).json({ message: 'Username or email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const admin = await Admin.create({
                username,
                password: hashedPassword,
                email
            });

            const token = jwt.sign(
                { id: admin._id, username: admin.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                success: true,
                data: {
                    token,
                    admin: {
                        id: admin._id,
                        username: admin.username,
                        email: admin.email
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!validateLogin(username, password)) {
                return res.status(400).json({ message: 'Invalid input' });
            }

            // Find admin
            const admin = await Admin.findOne({ username });
            if (!admin) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, admin.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { id: admin._id, username: admin.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                adminToken: token, // Changed from 'token' to 'adminToken' to match frontend
                admin: {
                    id: admin._id,
                    username: admin.username,
                    email: admin.email
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = new AuthController();