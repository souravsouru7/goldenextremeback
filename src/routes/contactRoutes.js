const express = require('express');
const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public route for submitting contact form
router.post('/', contactController.createContact);

// Protected route for admin to view submissions
router.get('/', auth, contactController.getContacts);

module.exports = router;
