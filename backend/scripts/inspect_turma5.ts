import { getStudentData } from '@/lib/sheets';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    try {
        const data = await getStudentData();
        const turma5Students = data.filter(s => s.sourceSheet?.includes('Turma 5'));

        console.log(`Total Turma 5 students: ${turma5Students.length}`);

        // Show unique values for the key columns that might identify A or B
        const uniqueTurmas = new Set();
        const uniqueCursos = new Set();

        turma5Students.forEach(s => {
            if (s['TURMA']) uniqueTurmas.add(s['TURMA']);
            if (s['CURSO']) uniqueCursos.add(s['CURSO']);
            if (s['Curso']) uniqueCursos.add(s['Curso']); // case sensitivity check
        });

        console.log('Unique "TURMA" values in Turma 5 sheets:', Array.from(uniqueTurmas));
        console.log('Unique "CURSO" values in Turma 5 sheets:', Array.from(uniqueCursos));

        console.log('\nSample of 10 students from Turma 5:');
        turma5Students.slice(0, 10).forEach(s => {
            console.log(`- ${s['Nome Completo']} | Turma: ${s['TURMA'] || '-'} | Curso: ${s['Curso'] || s['CURSO'] || '-'} | Sheet: ${s.sourceSheet}`);
        });

    } catch (error) {
        console.error('Failed to inspect data:', error);
    }
}

main();
