
const cron = require('node-cron');
const ScheduledMessage = require('../models/scheduledMessage.schema');

// Runs every minute
function startCronJob() {

    cron.schedule('* * * * *', async () => {
        console.log('Checking for scheduled messages...');

        try {
            const now = new Date();
            const messages = await ScheduledMessage.find({ 
                status: 'pending', 
                scheduledAt: { $lte: now } 
            });

            for (let msg of messages) {
                console.log('Sending message:', msg.message);
                // function for schedule mEssage
                await ScheduledMessage.updateOne({ _id: msg._id }, { status: 'sent' });
            }
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });
}

module.exports = startCronJob