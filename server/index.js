const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const {GoogleGenAI} = require('@google/genai');
const fs = require('fs');
require('dotenv').config();

const app = express();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
    res.send('Hey I am Vikas');
});

app.post('/upload', upload.single('pdf'), async (req, res) => {
    console.log(req.file);

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;
        
        const chunks = text.split('\n\n');

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: `Explain this pdf in simple text ${chunks[1]}`
        });

        res.send(response.text);

    } catch (err) { 
        console.log(err);
        res.status(500).send(err);
    }

});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});