const Event = require('../models/event');
const cloudinary = require('../config/cloudinary');

class EventController {
    async createEvent(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, error: 'Please provide at least one media file' });
            }

            // Upload media files to Cloudinary
            const mediaUrls = await Promise.all(
                req.files.map(async (file) => {
                    if (file.size > 50 * 1024 * 1024) { // 50MB limit
                        throw new Error('File size exceeds 50MB limit');
                    }

                    const result = await new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { resource_type: 'auto' },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        uploadStream.end(file.buffer);
                    });
                    return result.secure_url;
                })
            );

            const { name, location, dateTime, hasTicket, ticketPrice, description, sponsoredBy } = req.body;
            
            const event = await Event.create({
                name,
                location,
                dateTime,
                hasTicket: hasTicket === 'true',
                ticketPrice: hasTicket === 'true' ? ticketPrice : undefined,
                description,
                sponsoredBy,
                media: mediaUrls,
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

            let mediaUrls = event.media;

            // If new media files are provided, upload them
            if (req.files && req.files.length > 0) {
                const newMediaUrls = await Promise.all(
                    req.files.map(async (file) => {
                        if (file.size > 50 * 1024 * 1024) {
                            throw new Error('File size exceeds 50MB limit');
                        }

                        const result = await new Promise((resolve, reject) => {
                            const uploadStream = cloudinary.uploader.upload_stream(
                                { resource_type: 'auto' },
                                (error, result) => {
                                    if (error) reject(error);
                                    else resolve(result);
                                }
                            );
                            uploadStream.end(file.buffer);
                        });
                        return result.secure_url;
                    })
                );
                mediaUrls = newMediaUrls;
            }

            const { name, location, dateTime, hasTicket, ticketPrice, description, sponsoredBy } = req.body;
            
            const updatedEvent = await Event.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    location,
                    dateTime,
                    hasTicket: hasTicket === 'true',
                    ticketPrice: hasTicket === 'true' ? ticketPrice : undefined,
                    description,
                    sponsoredBy,
                    media: mediaUrls
                },
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

            // Delete media files from Cloudinary
            await Promise.all(
                event.media.map(async (mediaUrl) => {
                    const publicId = mediaUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                })
            );

            await Event.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, data: {} });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new EventController(); 