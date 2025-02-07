const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    numeroImmatriculation: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);