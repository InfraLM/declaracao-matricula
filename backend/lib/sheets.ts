import { google } from 'googleapis';

// Configuration for each sheet with its specific header row index
// Header row index is 0-based (0 = row 1, 1 = row 2, etc.)
const SHEET_CONFIG: { [key: string]: { headerRowIndex: number } } = {
    "Turma 3": { headerRowIndex: 1 },           // Header in row 2
    "Turma 4 (Essencial)": { headerRowIndex: 1 }, // Header in row 2
    "Turma 4 (Online)": { headerRowIndex: 0 },    // Header in row 1
    "Turma 5": { headerRowIndex: 1 },           // Header in row 2
    "Turma 5 (Online)": { headerRowIndex: 3 },    // Header in row 4
};

const TARGET_SHEETS = Object.keys(SHEET_CONFIG);

export interface StudentRecord {
    [key: string]: string;
}

// Helper to pad CPF with leading zeros
function normalizeCPF(cpf: string): string {
    if (!cpf) return '';
    const digitsOnly = cpf.replace(/\D/g, '');
    return digitsOnly.padStart(11, '0');
}

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

    const sheets = google.sheets({ version: 'v4', auth });
    return { sheets, spreadsheetId };
}

export async function getStudentData(): Promise<StudentRecord[]> {
    const { sheets, spreadsheetId } = await getSheetsClient();
    let allStudents: StudentRecord[] = [];

    console.log('Fetching data from sheets:', TARGET_SHEETS.join(', '));

    const promises = TARGET_SHEETS.map(async (sheetName) => {
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `'${sheetName}'!A:Z`,
            });

            const rows = response.data.values;
            if (!rows || rows.length < 2) return [];

            // Get header row index from config
            const config = SHEET_CONFIG[sheetName];
            const HEADER_ROW_INDEX = config ? config.headerRowIndex : 1;
            
            // Make sure we have enough rows
            if (rows.length <= HEADER_ROW_INDEX) return [];
            
            const headers = rows[HEADER_ROW_INDEX].map((h: string) => h?.trim() || '');
            const dataRows = rows.slice(HEADER_ROW_INDEX + 1);

            console.log(`Sheet "${sheetName}": Header row ${HEADER_ROW_INDEX + 1}, Headers: ${headers.slice(0, 5).join(', ')}..., ${dataRows.length} data rows`);

            return dataRows.map((row: any[]) => {
                const student: any = { sourceSheet: sheetName };
                headers.forEach((header, index) => {
                    if (header) {
                        let value = (row[index] || '').toString().trim();

                        // Normalize CPF specific logic
                        if (header.toUpperCase().includes('CPF')) {
                            value = normalizeCPF(value);
                        }

                        student[header] = value;
                    }
                });
                return student;
            });

        } catch (error) {
            console.warn(`Failed to read sheet "${sheetName}":`, error);
            return [];
        }
    });

    const results = await Promise.all(promises);
    results.forEach(sheetStudents => {
        allStudents = allStudents.concat(sheetStudents);
    });

    return allStudents;
}

export async function findStudentByEmail(email: string): Promise<StudentRecord | null> {
    const allStudents = await getStudentData();
    const normalizedEmail = email.toLowerCase().trim();
    return allStudents.find((s) => s['E-mail']?.toLowerCase().trim() === normalizedEmail) || null;
}
