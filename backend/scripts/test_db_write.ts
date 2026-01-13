
import { prisma } from "@/lib/prisma";

async function main() {
    console.log("🧪 Testando escrita no banco de dados...");
    try {
        const log = await prisma.logAcesso.create({
            data: {
                emailUsuario: "teste@manual.com",
                userAgent: "Script Teste Manual",
                ipAddress: "127.0.0.1",
            },
        });
        console.log("✅ SUCESSO! Registro criado com ID:", log.id);
    } catch (error: any) {
        console.error("❌ ERRO AO GRAVAR:");
        console.error(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
