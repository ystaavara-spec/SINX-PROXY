const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// TEMP DATABASE
let keys = [];

// HOME
app.get('/', (req, res) => {
    res.send('SINX API ONLINE');
});

// GENERATE KEY
app.post('/api/generate', (req, res) => {
    const { ip, duration } = req.body;

    if (!ip || !duration) {
        return res.status(400).json({
            success: false,
            message: 'Missing IP or duration'
        });
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let key = 'SINX_';

    for (let i = 0; i < 4; i++) {
        key += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    const newKey = {
        key,
        ip,
        duration,
        createdAt: Date.now(),
        expiresAt:
            Date.now() +
            duration * 24 * 60 * 60 * 1000,
        status: 'active'
    };

    keys.push(newKey);

    res.json({
        success: true,
        data: newKey
    });
});

// CHECK KEY
app.post('/api/check', (req, res) => {
    const { key, ip } = req.body;

    const found = keys.find(k => k.key === key);

    if (!found) {
        return res.json({
            success: false,
            message: 'Key not found'
        });
    }

    if (found.ip !== ip) {
        return res.json({
            success: false,
            message: 'IP not allowed'
        });
    }

    if (Date.now() > found.expiresAt) {
        return res.json({
            success: false,
            message: 'Key expired'
        });
    }

    res.json({
        success: true,
        message: 'Access granted'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('SINX API RUNNING ON PORT ' + PORT);
});
