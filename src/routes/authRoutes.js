const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route example
router.get('/dashboard', auth, (req, res) => {
    res.json({ 
        success: true, 
        data: {
            admin: {
                id: req.admin._id,
                username: req.admin.username,
                email: req.admin.email
            }
        }
    });
});

module.exports = router;