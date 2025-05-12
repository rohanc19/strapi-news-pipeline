const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Initialize Express app
const app = express();

// Use the PORT environment variable provided by Render
const PORT = process.env.PORT || 10000;

// In-memory storage for prediction markets
let predictionMarkets = [];
const dataFilePath = path.join(__dirname, 'data.json');

// Try to load existing data
try {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    predictionMarkets = JSON.parse(data);
    console.log(`Loaded ${predictionMarkets.length} prediction markets from data.json`);
  }
} catch (error) {
  console.error('Error loading data file:', error);
}

// Save data to file
const saveData = () => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(predictionMarkets, null, 2), 'utf8');
    console.log(`Saved ${predictionMarkets.length} prediction markets to data.json`);
  } catch (error) {
    console.error('Error saving data file:', error);
  }
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint for Render
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Prediction Markets API is running',
    timestamp: new Date().toISOString(),
    markets_count: predictionMarkets.length
  });
});

// Specific health check endpoint for Render
app.get('/_health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get all prediction markets
app.get('/api/prediction-markets', (req, res) => {
  try {
    res.json({ data: predictionMarkets });
  } catch (error) {
    console.error('Error fetching prediction markets:', error);
    res.status(500).json({ error: 'Failed to fetch prediction markets' });
  }
});

// Create a new prediction market
app.post('/api/prediction-markets', (req, res) => {
  try {
    const marketData = req.body.data;
    
    if (!marketData) {
      return res.status(400).json({ error: 'No market data provided' });
    }
    
    // Add an ID and timestamp if not provided
    const newMarket = {
      id: marketData.id || `market_${Date.now()}`,
      createdAt: marketData.createdAt || new Date().toISOString(),
      ...marketData
    };
    
    // Add to the in-memory array
    predictionMarkets.push(newMarket);
    
    // Save to file
    saveData();
    
    res.status(201).json({ data: newMarket });
  } catch (error) {
    console.error('Error creating prediction market:', error);
    res.status(500).json({ error: 'Failed to create prediction market' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
