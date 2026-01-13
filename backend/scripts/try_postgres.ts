
import { PrismaClient } from "@prisma/client";

// Tenta conectar com o superusuário postgres
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:123456@localhost:5432/liberdade-medica?schema=dec_matricula",
        },
    },
});

async function main() {
    console.log("🕵️ Tentando conectar como 'postgres'...");
    try {
        const user = await prisma.$queryRaw`SELECT current_user`;
        console.log("✅ SUCESSO! Conectado como:", user);

        // Tenta listar o schema para ver se enxerga
        const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'dec_matricula'`;
        console.log("📋 Tabelas visíveis:", tables);

    } catch (error: any) {
        console.error("❌ Falha ao conectar como postgres:");
        console.error(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
