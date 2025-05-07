const Event = require('../models/event');
const cloudinary = require('../config/cloudinary');

class EventController {
    async createEvent(req, res) {
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

            const { name, location, dateTime, hasTicket, ticketPrice, description, sponsoredBy } = req.body;
            
            const event = await Event.create({
                name,
                location,
                dateTime,
                hasTicket: hasTicket === 'true',
                ticketPrice: hasTicket === 'true' ? ticketPrice : undefined,
                description,
                sponsoredBy,
                image: result.secure_url,
                createdBy: req.admin.id
            });

            res.status(201).json({ success: true, data: event });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getEvents(req, res) {
        try {
            const events = await Event.find().populate('createdBy', 'username');
            res.status(200).json({ success: true, data: events });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getEventById(req, res) {
        try {
            const event = await Event.findById(req.params.id).populate('createdBy', 'username');
            if (!event) {
                return res.status(404).json({ success: false, error: 'Event not found' });
            }
            res.status(200).json({ success: true, data: event });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateEvent(req, res) {
        try {
            const event = await Event.findById(req.params.id);
            if (!event) {
                return res.status(404).json({ success: false, error: 'Event not found' });
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

            const updatedEvent = await Event.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            res.status(200).json({ success: true, data: updatedEvent });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async deleteEvent(req, res) {
        try {
            const event = await Event.findById(req.params.id);
            if (!event) {
                return res.status(404).json({ success: false, error: 'Event not found' });
            }

            // Delete image from Cloudinary
            const publicId = event.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);

            await Event.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, data: {} });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new EventController(); 