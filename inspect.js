const { google } = require('googleapis');
require('dotenv').config();

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return { sheets, spreadsheetId };
}

async function main() {
    const { sheets, spreadsheetId } = await getSheetsClient();
    const targetSheets = ["Turma 5", "Turma 5 (online)"];

    for (const sheetName of targetSheets) {
        console.log(`\n--- Inspecting [${sheetName}] ---`);
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `'${sheetName}'!A:Z`,
            });
            const rows = response.data.values;
            if (!rows || rows.length < 2) {
                console.log('No data found');
                continue;
            }
            const headers = rows[1];
            const sample = rows.slice(2, 7); // First 5 data rows

            console.log('Headers:', headers.join(' | '));
            sample.forEach((row, idx) => {
                console.log(`Row ${idx + 3}:`, row.join(' | '));
            });
        } catch (e) {
            console.error(`Error reading ${sheetName}:`, e.message);
        }
    }
}

main();
