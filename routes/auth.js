const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

// Route d'inscription
router.post('/register', async (req, res) => {
    console.log('Début de la route /register');
    try {
        console.log('Données reçues:', req.body);
        
        // Vérification de la connexion MongoDB
        if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB non connecté');
            return res.status(500).json({ message: 'Erreur de base de données' });
        }

        const { fullName, email, password, phoneNumber } = req.body;
        
        // Validation plus détaillée
        if (!fullName) return res.status(400).json({ message: 'Nom complet requis' });
        if (!email) return res.status(400).json({ message: 'Email requis' });
        if (!password) return res.status(400).json({ message: 'Mot de passe requis' });
        if (!phoneNumber || !/^0[5-7][0-9]{8}$/.test(phoneNumber)) return res.status(400).json({ message: 'Numéro de téléphone algérien requis' });

        console.log('Validation des champs OK');

        // Vérification de l'email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Email déjà utilisé:', email);
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        console.log('Vérification email OK');

        // Hash du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('Hash du mot de passe OK');

        // Création de l'utilisateur
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber
        });

        console.log('Utilisateur créé, avant sauvegarde');

        // Sauvegarde
        await user.save();
        console.log('Utilisateur sauvegardé avec succès');

        // Création du token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Token créé avec succès');

        // Réponse
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token
        });

    } catch (error) {
        console.error('Erreur complète:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Créer et retourner le token JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;