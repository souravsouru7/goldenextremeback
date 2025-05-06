const express = require('express');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure multer without size limits
const upload = multer({ 
    storage: multer.memoryStorage()
});

const router = express.Router();

// Public routes (no auth required)
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected routes (auth required)
router.post('/', auth, upload.single('image'), productController.createProduct);
router.put('/:id', auth, upload.single('image'), productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;