const express = require("express");
const ScheduledMessage = require("../models/scheduledMessage.schema");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { message, day, time } = req.body;

        if (!message || !day || !time) {
            return res.status(400).json({ error: 'Message, day, and time are required' });
        }

        // Convert to a valid Date object
        const scheduledDate = new Date(`${day} ${time}`);

        if (isNaN(scheduledDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date or time format' });
        }

        // Save to DB
        const newMessage = new ScheduledMessage({
            message,
            scheduledAt: scheduledDate,
            status: 'pending'
        });

        await newMessage.save();
        res.status(201).json({ success: true, message: 'Message scheduled successfully', data: newMessage });
    } catch (error) {
        console.error('Error scheduling message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
