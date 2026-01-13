
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🕵️ DIAGNÓSTICO DE BANCO DE DADOS");

    try {
        // 1. Check Connection & Current User
        const user = await prisma.$queryRaw`SELECT current_user, current_database(), version()`;
        console.log("✅ Conexão OK!");
        console.log("👤 Usuário/Banco:", user);

        // 2. List Schemas
        console.log("\n📂 Schemas disponíveis:");
        const schemas = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
    `;
        console.table(schemas);

        // 3. List Tables in 'dec_matricula'
        console.log("\n📋 Tabelas no schema 'dec_matricula':");
        const tablesDec = await prisma.$queryRaw`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'dec_matricula'
    `;
        console.table(tablesDec);

        // 4. List Tables in 'public' (just in case)
        console.log("\n📋 Tabelas no schema 'public':");
        const tablesPublic = await prisma.$queryRaw`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
        console.table(tablesPublic);

    } catch (error: any) {
        console.error("❌ ERRO GRAVE DE CONEXÃO:");
        console.error(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
