const Product = require('../models/product');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

class ProductController {
    async createProduct(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, error: 'Please provide an image' });
            }

            // Upload image to Cloudinary
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });

            const { name, description, category, subcategory, brandName } = req.body;
            
            const product = await Product.create({
                name,
                brandName,
                description,
                image: result.secure_url,
                category,
                subcategory,
                createdBy: req.admin.id
            });
            res.status(201).json({ success: true, data: product });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getProducts(req, res) {
        try {
            const products = await Product.find().populate('createdBy', 'username');
            res.status(200).json({ success: true, data: products });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getProductById(req, res) {
        try {
            const product = await Product.findById(req.params.id).populate('createdBy', 'username');
            if (!product) {
                return res.status(404).json({ success: false, error: 'Product not found' });
            }
            res.status(200).json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ success: false, error: 'Product not found' });
            }

            // If a new image is provided, upload it to Cloudinary
            if (req.file) {
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { resource_type: 'auto' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(req.file.buffer);
                });
                req.body.image = result.secure_url;
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            res.status(200).json({ success: true, data: updatedProduct });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async deleteProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ success: false, error: 'Product not found' });
            }

            // Delete image from Cloudinary
            const publicId = product.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);

            await Product.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, data: {} });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new ProductController();
