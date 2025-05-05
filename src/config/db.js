const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');

const seedDefaultAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ username: process.env.DEFAULT_ADMIN_USERNAME });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 10);
            await Admin.create({
                username: process.env.DEFAULT_ADMIN_USERNAME,
                password: hashedPassword,
                email: process.env.DEFAULT_ADMIN_EMAIL
            });
            console.log('Default admin account created');
        }
    } catch (error) {
        console.error('Error seeding default admin:', error);
    }
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`MongoDB connected: ${conn.connection.host}`);
        await seedDefaultAdmin();
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;