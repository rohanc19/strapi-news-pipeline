const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeDatabase, getPredictionMarkets, createPredictionMarket } = require('./database');

// Initialize Express app
const app = express();

// Use the PORT environment variable provided by Render
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint for Render
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Prediction Markets API is running',
    timestamp: new Date().toISOString()
  });
});

// Get all prediction markets
app.get('/api/prediction-markets', async (req, res) => {
  try {
    const markets = await getPredictionMarkets();
    res.json({ data: markets });
  } catch (error) {
    console.error('Error fetching prediction markets:', error);
    res.status(500).json({ error: 'Failed to fetch prediction markets' });
  }
});

// Create a new prediction market
app.post('/api/prediction-markets', async (req, res) => {
  try {
    const marketData = req.body.data;
    
    if (!marketData) {
      return res.status(400).json({ error: 'No market data provided' });
    }
    
    const newMarket = await createPredictionMarket(marketData);
    res.status(201).json({ data: newMarket });
  } catch (error) {
    console.error('Error creating prediction market:', error);
    res.status(500).json({ error: 'Failed to create prediction market' });
  }
});

// Initialize the database
initializeDatabase()
  .then(() => {
    console.log('Database initialized');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
