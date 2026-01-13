import { google } from 'googleapis';

// The specific tabs required by the user
const TARGET_SHEETS = [
    "Turma 3",
    "Turma 4 (Essencial)",
    "Turma 4 (Online)",
    "Turma 5",
    "Turma 5 (Online)"
];

export interface StudentRecord {
    [key: string]: string;
}

// Helper to pad CPF with leading zeros
function normalizeCPF(cpf: string): string {
    if (!cpf) return '';
    // Remove non-numeric characters first to check potential length? 
    // Or just keep it as is if it already has punctuation?
    // User said "cpfs começando com 0 perdem a formatação". 
    // Usually this means they become digits like 1234567890 instead of 01234567890.
    // We will remove non-digits, pad to 11, and then optionally re-format if needed.
    // For now, let's just ensure we have the digits, maybe user wants formatted?
    // "cpfs que tiverem menos de 11 digitos teremos que adicionar zeros na frente"

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

    // We can fetch them in parallel for speed
    const promises = TARGET_SHEETS.map(async (sheetName) => {
        try {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `'${sheetName}'!A:Z`,
            });

            const rows = response.data.values;
            if (!rows || rows.length < 2) return [];

            // Assumption: All these sheets share the same structure 
            // where Row 2 (index 1) contains the headers.
            const HEADER_ROW_INDEX = 1;
            const headers = rows[HEADER_ROW_INDEX].map((h: string) => h.trim());
            const dataRows = rows.slice(HEADER_ROW_INDEX + 1);

            return dataRows.map((row: any[]) => {
                const student: any = { sourceSheet: sheetName }; // Track source
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
            return []; // Return empty for this sheet but continue others
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
