const express = require('express');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Import the cors middleware
const multer = require('multer'); // Import multer for file uploads
const bodyParser = require('body-parser');
const authRoutes = require('./server/routes/auth'); // Use relative path
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors()); // Use the cors middleware
app.use('/auth', authRoutes);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error('MongoDB URI is not defined in environment variables');
    process.exit(1);
}

// Connect to MongoDB Atlas
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB Atlas');
});

// Define a schema and model for users
const userSchema = new mongoose.Schema({
    numeroImmatriculation: { type: String, unique: true },
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Registration endpoint
app.post('/register', async (req, res) => {
    const { numeroImmatriculation, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ numeroImmatriculation, email, password: hashedPassword });
        await user.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { numeroImmatriculation, password } = req.body;

    try {
        const user = await User.findOne({ numeroImmatriculation });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ success: false, message: 'Invalid numeroImmatriculation or password' });
        }

        const token = jwt.sign({ id: user._id }, 'your_jwt_secret');
        res.json({ success: true, token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.studentId = decoded.id;
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid token.' });
    }
};

// Endpoint to import data from Excel
app.get('/import', async (req, res) => {
    try {
        const filePath = path.join('C:', 'Users', 'Amara Mehdi', 'Downloads', 'Résultats des examens du Semestre 1_ST LMD 1_2024-2025 (1).xlsx');
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert the data to JSON
        const data = xlsx.utils.sheet_to_json(sheet);

        // Save the data to MongoDB
        for (const studentData of data) {
            console.log(studentData); // Log the student data to debug
            const student = new Student({
                fullName: `${studentData['Nom']} ${studentData['Prénom']}`, // Combine Nom and Prénom
                email: studentData['Email'], // Adjust the key if necessary
                numeroImmatriculation: studentData['Matricule'],
                groupe: studentData['Group'],
                notes: [
                    { subject: 'Maths 1', grade: studentData['Maths 1'] },
                    { subject: 'Phys1', grade: studentData['Phys1'] },
                    { subject: 'Chimie 1', grade: studentData['Chimie 1'] },
                    { subject: 'Info 1', grade: studentData['Info 1'] },
                    { subject: 'MR', grade: studentData['MR'] },
                    { subject: 'MST1', grade: studentData['MST1'] },
                    { subject: 'DED', grade: studentData['DED'] },
                    { subject: 'Angl 1', grade: studentData['Angl 1'] }
                ] // Adjust the key if necessary
            });
            await student.save();
            console.log(`Saved student: ${student.fullName}`);
        }

        res.send('Data import completed.');
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).send('Error importing data');
    }
});

app.get('/profile', verifyToken, async (req, res) => {
    const student = await Student.findById(req.studentId);

    if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, student });
});

app.post('/profile/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    const student = await Student.findById(req.studentId);

    if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.avatar = `/uploads/${req.file.filename}`;
    await student.save();

    res.json({ success: true, avatarUrl: student.avatar });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});