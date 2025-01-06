const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');

app.use(express.json());
app.use(cors({
    origin: ' https://f4d0-43-216-7-255.ngrok-free.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

// Channel Access Token for the Messaging API
const LINE_CHANNEL_ACCESS_TOKEN = 'v6wSvu/FchsEEw4VFhm7aJB7XyBHbQg0Cxihu2n0sQKZ0egvCqbQACEBceAmcUI34tgq+D9/R5iJyVBLcQ21/yfs9VlG1qBVV9V1+rk0Y1DdoaXD4BqoO1qMUaNDtiO4GPqGI8fo/umXc8LyUirSRwdB04t89/1O/w1cDnyilFU=';

// Verify token middleware
const verifyToken = (req, res, next) => {
    const token = LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
        return res.status(401).json({ error: 'Missing LINE Channel Access Token' });
    }
    next();
};

app.post('/send-message', verifyToken, async (req, res) => {
    try {
        const { userId, message } = req.body;

        console.log('=== Incoming Message Request ===');
        console.log('UserId:', userId);
        console.log('Message:', message);

        if (!userId || !message) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Validate userId format (LINE user IDs typically start with 'U')
        if (!userId.startsWith('U')) {
            return res.status(400).json({ error: 'Invalid userId format' });
        }

        const payload = {
            to: userId,
            messages: [{
                type: 'text',
                text: message
            }]
        };

        console.log('Sending message with payload:', payload);

        const response = await axios({
            method: 'post',
            url: 'https://api.line.me/v2/bot/message/push',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
            },
            data: payload
        });

        console.log('LINE API Response:', response.data);
        res.status(200).json({ success: true, data: response.data });

    } catch (error) {
        console.error('=== Error Details ===');
        console.error('Error Message:', error.message);

        if (error.response) {
            console.error('LINE API Error Response:', {
                status: error.response.status,
                data: error.response.data
            });

            // Handle specific LINE API errors
            if (error.response.status === 400) {
                return res.status(400).json({
                    error: {
                        message: 'Invalid request to LINE API',
                        details: error.response.data
                    }
                });
            }

            if (error.response.status === 401) {
                return res.status(401).json({
                    error: {
                        message: 'Invalid LINE Channel Access Token',
                        details: error.response.data
                    }
                });
            }
        }

        res.status(500).json({
            error: {
                message: 'Failed to send message',
                details: error.response?.data || error.message
            }
        });
    }
});

// Test endpoint to verify server is running
app.get('/test', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(3100, () => {
    console.log('Server running on port 3100');
    console.log('LINE Channel Access Token is configured');
});