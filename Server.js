const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

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

// Test de connexion MongoDB
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connecté à MongoDB avec succès');
        console.log('URI utilisé:', process.env.MONGODB_URI);
    })
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB:', err);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});