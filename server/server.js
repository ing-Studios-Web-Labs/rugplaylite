const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();

// Get run mode from env file
const runMode = process.env.RUN_MODE || 'local';

let API_KEY;

if (runMode === 'local') {
    API_KEY = process.env.RUGPLAY_API_KEY;
    console.log('Loaded API Key:', API_KEY || 'No API key found');
} else {
    console.log('Running on deployed mode, not fetching API key from env.');
}

// Use environment variable for port, or default to 3000
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json({ limit: '50mb' }));

console.log('Run mode:', runMode);

if (runMode === 'local') {
    console.log('Running local methods.');
    app.get('/api/top-coins', async (req, res) => {
        try {
            const response = await fetch('https://rugplay.com/api/v1/top', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
            });

            console.log('External API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                return res.status(response.status).json({ 
                    error: 'Failed to fetch data from external API.',
                    details: errorText 
                });
            }

            const data = await response.json();
            console.log('Successfully fetched data:', data);
            res.json(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    app.get('/api/market-data', async (req, res) => {
        try {
            const params = {
                search: req.query.search,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
                priceFilter: req.query.priceFilter,
                changeFilter: req.query.changeFilter,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 12
            };

            const url = new URL('https://rugplay.com/api/v1/market');

            url.search = new URLSearchParams(params).toString();
            
            console.log('Fetching from URL:', url.toString());

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
            });

            console.log('External API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                return res.status(response.status).json({ 
                    error: 'Failed to fetch data from external API.',
                    details: errorText 
                });
            }

            const data = await response.json();
            console.log('Successfully fetched data:', data);
            res.json(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    app.get('/api/coin-info', async (req, res) => {
        try {
            const params = {
                timeframe: req.query.timeframe || '1m'
            };

            const url = new URL(`https://rugplay.com/api/v1/coin/${req.query.symbol}`);

            url.search = new URLSearchParams(params).toString();
            
            console.log('Fetching from URL:', url.toString());

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
            });

            console.log('External API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                return res.status(response.status).json({ 
                    error: 'Failed to fetch data from external API.',
                    details: errorText 
                });
            }

            const data = await response.json();
            console.log('Successfully fetched data:', data);
            res.json(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    app.get('/api/coin-holders', async (req, res) => {
        try {
            const params = {
                limit: req.query.limit || 50
            };

            const url = new URL(`https://rugplay.com/api/v1/holders/${req.query.symbol}`);

            url.search = new URLSearchParams(params).toString();
            
            console.log('Fetching from URL:', url.toString());

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
            });

            console.log('External API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                return res.status(response.status).json({ 
                    error: 'Failed to fetch data from external API.',
                    details: errorText 
                });
            }

            const data = await response.json();
            console.log('Successfully fetched data:', data);
            res.json(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
} else {
    console.log('Running deployed methods.');
    app.get('/api/top-coins', async (req, res) => {
        try {
            const response = await fetch('https://rugplay.com/api/v1/top', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${req.query.apikey}`,
                    'Content-Type': 'application/json'
                },
            });

            console.log('External API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                return res.status(response.status).json({ 
                    error: 'Failed to fetch data from external API.',
                    details: errorText 
                });
            }

            const data = await response.json();
            console.log('Successfully fetched data:', data);
            res.json(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    app.get('/api/market-data', async (req, res) => {
        try {
            const params = {
                search: req.query.search,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
                priceFilter: req.query.priceFilter,
                changeFilter: req.query.changeFilter,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 12
            };

            const url = new URL('https://rugplay.com/api/v1/market');

            url.search = new URLSearchParams(params).toString();
            
            console.log('Fetching from URL:', url.toString());

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${req.query.apikey}`,
                    'Content-Type': 'application/json'
                },
            });

            console.log('External API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                return res.status(response.status).json({ 
                    error: 'Failed to fetch data from external API.',
                    details: errorText 
                });
            }

            const data = await response.json();
            console.log('Successfully fetched data:', data);
            res.json(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    app.get('/api/coin-info', async (req, res) => {
        try {
            const params = {
                timeframe: req.query.timeframe || '1m'
            };

            const url = new URL(`https://rugplay.com/api/v1/coin/${req.query.symbol}`);

            url.search = new URLSearchParams(params).toString();
            
            console.log('Fetching from URL:', url.toString());

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${req.query.apikey}`,
                    'Content-Type': 'application/json'
                },
            });

            console.log('External API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                return res.status(response.status).json({ 
                    error: 'Failed to fetch data from external API.',
                    details: errorText 
                });
            }

            const data = await response.json();
            console.log('Successfully fetched data:', data);
            res.json(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    app.get('/api/coin-holders', async (req, res) => {
        try {
            const params = {
                limit: req.query.limit || 50
            };

            const url = new URL(`https://rugplay.com/api/v1/holders/${req.query.symbol}`);

            url.search = new URLSearchParams(params).toString();
            
            console.log('Fetching from URL:', url.toString());

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${req.query.apikey}`,
                    'Content-Type': 'application/json'
                },
            });

            console.log('External API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                return res.status(response.status).json({ 
                    error: 'Failed to fetch data from external API.',
                    details: errorText 
                });
            }

            const data = await response.json();
            console.log('Successfully fetched data:', data);
            res.json(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
}

app.post('/api/graph', (req, res) => {
    console.log('Request body:', req.body);
    const { coin, candlestickData, volumeData, timeframe } = req.body;
    const dataToSend = JSON.stringify(req.body);

    const pythonScriptPath = path.join(__dirname, 'graph_generation', 'coingraph_generator.py');

    const pythonProcess = spawn('python', [pythonScriptPath]);
    pythonProcess.stdin.write(dataToSend);
    pythonProcess.stdin.end();

    let pythonOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
            try {
                const graphData = JSON.parse(pythonOutput);
                console.log('Returning graph data:', graphData);
                res.json({ success: true, graphData });
            } catch (e) {
                console.error("Failed to parse JSON from Python script:", e);
                res.status(500).json({ success: false, error: 'Failed to process graph data' });
            }
        } else {
            console.error(`Python script exited with code ${code}`);
            res.status(500).json({ success: false, error: 'Graph generation failed' });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});