require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const app = express();
const port = process.env.BACKEND_PORT || 3001;

// Initialize Prisma
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Helper: Normalize CPF
function normalizeCPF(cpf) {
    if (!cpf) return '';
    const digitsOnly = cpf.toString().replace(/\D/g, '');
    return digitsOnly.padStart(11, '0');
}

// Google Sheets Config
const TARGET_SHEETS = [
    "Turma 3",
    "Turma 4 (essencial)",
    "Turma 4 (Online)",
    "Turma 5",
    "Turma 5 (online)"
];

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!clientEmail || !privateKey || !spreadsheetId) {
        throw new Error('Google Sheets credentials are not fully configured in .env');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return { sheets: google.sheets({ version: 'v4', auth }), spreadsheetId };
}

// Endpoint: Search Students
app.get('/api/students/search', async (req, res) => {
    try {
        const query = req.query.q?.toLowerCase() || '';
        if (!query) return res.json({ data: [] });

        const { sheets, spreadsheetId } = await getSheetsClient();
        let allStudents = [];

        const promises = TARGET_SHEETS.map(async (sheetName) => {
            try {
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: `'${sheetName}'!A:Z`,
                });
                const rows = response.data.values;
                if (!rows || rows.length < 2) return [];

                const headers = rows[1].map(h => h.trim());
                const dataRows = rows.slice(2);

                return dataRows.map(row => {
                    const student = { sourceSheet: sheetName };
                    headers.forEach((header, index) => {
                        if (header) {
                            let value = (row[index] || '').toString().trim();
                            if (header.toUpperCase().includes('CPF')) value = normalizeCPF(value);
                            student[header] = value;
                        }
                    });
                    return student;
                });
            } catch (e) { return []; }
        });

        const results = await Promise.all(promises);
        results.forEach(s => allStudents = allStudents.concat(s));

        const filtered = allStudents.filter(s =>
            (s['Nome Completo']?.toLowerCase() || '').includes(query) ||
            (s['CPF'] || '').includes(query)
        ).slice(0, 20);

        res.json({ data: filtered });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint: Get Specific Student
app.get('/api/students/:cpf', async (req, res) => {
    try {
        const cpf = normalizeCPF(req.params.cpf);
        const { sheets, spreadsheetId } = await getSheetsClient();

        const promises = TARGET_SHEETS.map(async (sheetName) => {
            const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: `'${sheetName}'!A:Z` });
            const rows = response.data.values;
            if (!rows || rows.length < 2) return null;
            const headers = rows[1].map(h => h.trim());
            const cpfIndex = headers.findIndex(h => h.toUpperCase().includes('CPF'));

            const row = rows.slice(2).find(r => normalizeCPF(r[cpfIndex]) === cpf);
            if (!row) return null;

            const student = { sourceSheet: sheetName };
            headers.forEach((h, i) => student[h] = (row[i] || '').toString().trim());
            return student;
        });

        const results = await Promise.all(promises);
        const student = results.find(s => s !== null);

        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ data: student });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
