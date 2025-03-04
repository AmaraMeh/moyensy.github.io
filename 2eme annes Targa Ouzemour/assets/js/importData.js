// filepath: /c:/Users/Amara Mehdi/Desktop/Wrapped/moyenne-isetcom-master/importData.js
const xlsx = require('xlsx');
const mongoose = require('mongoose');

// MongoDB Atlas connection URI
const uri = 'mongodb+srv://Amaramehdi1:u6q55DhztS6UpcK@cluster0.2m66m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB Atlas
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB Atlas');
});

// Define a schema and model for students
const studentSchema = new mongoose.Schema({
    fullName: String,
    numeroImmatriculation: String
});

const Student = mongoose.model('Student', studentSchema);

// Read the Excel file
const workbook = xlsx.readFile('C:\\Users\\Amara Mehdi\\Downloads\\Résultats des examens du Semestre 1_ST LMD 1_2024-2025 (1).xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert the data to JSON
let data = xlsx.utils.sheet_to_json(sheet);

// Limit the data to the first 2300 rows
data = data.slice(0, 2300);

// Log the data to check its structure
console.log(data);

// Save the data to MongoDB Atlas
data.forEach(async (studentData) => {
    // Map the keys to match the schema
    const mappedData = {
        fullName: `${studentData['Nom']} ${studentData['Prénom']}`, // Concatenate Nom and Prénom
        numeroImmatriculation: studentData['Matricule'] // Adjust the key as per your Excel file
    };
    console.log(mappedData); // Log the mapped data to check its structure
    const student = new Student(mappedData);
    try {
        await student.save();
        console.log(`Saved student: ${student.fullName}`);
    } catch (error) {
        console.error(`Error saving student: ${student.fullName}`, error);
    }
});

console.log('Data import completed.');