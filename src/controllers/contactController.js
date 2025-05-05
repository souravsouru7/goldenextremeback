const Contact = require('../models/contact');
const { validateContact } = require('../utils/validation');

class ContactController {
    async createContact(req, res) {
        try {
            const { firstName, lastName, email, mobileNumber, message } = req.body;

            if (!validateContact(firstName, lastName, email, mobileNumber, message)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid input data' 
                });
            }

            const contact = await Contact.create({
                firstName,
                lastName,
                email,
                mobileNumber,
                message
            });

            res.status(201).json({
                success: true,
                data: contact
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async getContacts(req, res) {
        try {
            const contacts = await Contact.find().sort({ createdAt: -1 });
            res.status(200).json({
                success: true,
                data: contacts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ContactController();
