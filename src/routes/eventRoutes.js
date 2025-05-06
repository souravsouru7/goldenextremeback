const express = require('express');
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer without size limits
const upload = multer({
    storage: multer.memoryStorage()
});

const router = express.Router();

// Public routes (no auth required)
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Protected routes (auth required)
router.post('/', auth, upload.array('media', 10), eventController.createEvent);
router.put('/:id', auth, upload.array('media', 10), eventController.updateEvent);
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router; 