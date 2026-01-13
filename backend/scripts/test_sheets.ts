
import { getStudentData } from '@/lib/sheets';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log('Testing Google Sheets connection multiple tabs...');
    try {
        const data = await getStudentData();
        console.log(`Total records fetched: ${data.length}`);

        // Group counts by sheet
        const counts: { [key: string]: number } = {};
        data.forEach(s => {
            const sheet = s.sourceSheet || 'Unknown';
            counts[sheet] = (counts[sheet] || 0) + 1;
        });
        console.log('Records per sheet:', counts);

        // Verify CPF normalization
        console.log('\nChecking CPF normalization (first 5 that started with 0 originally? Hard to tell, showing regex matches):');
        const zeroStartCPFs = data.filter(s => s['CPF'] && s['CPF'].startsWith('0')).slice(0, 5);

        if (zeroStartCPFs.length > 0) {
            console.log('Sample CPFs starting with 0:');
            zeroStartCPFs.forEach(s => console.log(`- ${s['Nome Completo']} (${s.sourceSheet}): ${s['CPF']}`));
        } else {
            console.log('No CPFs starting with 0 found (or all data has non-zero starts).');
        }

        // Show sample of random record
        if (data.length > 0) {
            const random = data[Math.floor(Math.random() * data.length)];
            console.log('\nRandom record sample:', random);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

main();
