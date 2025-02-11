const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// Import des routes
const authRoutes = require('./routes/auth');
// const surveysRoutes = require('./routes/surveys'); // Commented out as the file does not exist
// const supportRoutes = require('./routes/support'); // Commented out as the file does not exist

const app = express();

// Middleware de sécurité pour la production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });
}

// Configuration CORS plus permissive
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // Ajoutez vos domaines
    credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// Route de test principale
app.get('/', (req, res) => {
    res.json({ 
        message: "Bienvenue sur l'API ISET'COM !",
        endpoints: {
            auth: '/api/auth/test',
            surveys: '/api/surveys/test',
            support: '/api/support/test'
        }
    });
});

// Route de test pour vérifier CORS
app.get('/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Log toutes les requêtes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/surveys', surveysRoutes); // Commented out as the file does not exist
// app.use('/api/support', supportRoutes); // Commented out as the file does not exist

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});