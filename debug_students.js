const { google } = require('googleapis');
require('dotenv').config();

async function debugCompare() {
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    const auth = new google.auth.GoogleAuth({
        credentials: { client_email: clientEmail, private_key: privateKey },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const TARGET_SHEETS = [
        "Turma 3",
        "Turma 4 (essencial)",
        "Turma 4 (Online)",
        "Turma 5",
        "Turma 5 (online)"
    ];

    console.log("--- DIAGNOSTIC START ---");

    for (const sheetName of TARGET_SHEETS) {
        try {
            const res = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `'${sheetName}'!A1:Z500`,
            });
            const rows = res.data.values;
            if (!rows || rows.length < 2) continue;

            const headers = rows[1]; // Header is on Row 2
            const data = rows.slice(2);

            data.forEach((row, idx) => {
                const record = {};
                headers.forEach((h, i) => { record[h] = row[i]; });

                const nome = (record['Nome Completo'] || record['NOME COMPLETO'] || "").toUpperCase();
                if (nome.includes("CARLOS FELIPE") || nome.includes("ADELMO")) {
                    console.log(`Found [${nome}] in [${sheetName}] at row [${idx + 3}]`);
                    console.log(JSON.stringify(record, null, 2));
                    console.log("-------------------");
                }
            });
        } catch (e) {
            console.error(`Error reading ${sheetName}:`, e.message);
        }
    }
}

debugCompare();
