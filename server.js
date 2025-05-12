const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 1337;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
let pool;
if (process.env.DATABASE_URL) {
  const config = parse(process.env.DATABASE_URL);
  pool = new Pool({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    database: config.database,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  pool = new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'prediction_markets'
  });
}

// Initialize database
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prediction_markets (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        tags JSONB,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        resolution_time TIMESTAMP,
        yes_count INTEGER DEFAULT 0,
        no_count INTEGER DEFAULT 0,
        current_yes_probability DECIMAL DEFAULT 0.5,
        current_no_probability DECIMAL DEFAULT 0.5,
        resolution_source TEXT,
        external_id TEXT
      )
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Prediction Markets API is running' });
});

// Health check endpoint for Render
app.get('/_health', (req, res) => {
  res.status(200).send('OK');
});

// Get all prediction markets
app.get('/api/prediction-markets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM prediction_markets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching prediction markets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific prediction market
app.get('/api/prediction-markets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM prediction_markets WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prediction market not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching prediction market:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new prediction market
app.post('/api/prediction-markets', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      status,
      startTime,
      endTime,
      resolutionTime,
      yesCount,
      noCount,
      currentYesProbability,
      currentNoProbability,
      resolutionSource,
      externalId
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO prediction_markets (
        title, description, category, tags, status, start_time, end_time, 
        resolution_time, yes_count, no_count, current_yes_probability, 
        current_no_probability, resolution_source, external_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        title,
        description,
        category,
        JSON.stringify(tags),
        status || 'open',
        startTime,
        endTime,
        resolutionTime,
        yesCount || 0,
        noCount || 0,
        currentYesProbability || 0.5,
        currentNoProbability || 0.5,
        resolutionSource,
        externalId
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating prediction market:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, async () => {
  await initializeDatabase();
  console.log(`Server running on port ${port}`);
});
