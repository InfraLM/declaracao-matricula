
import { prisma } from "@/lib/prisma";

async function main() {
    console.log("🔍 Verificando últimos logs de acesso...");
    const logs = await prisma.logAcesso.findMany({
        orderBy: { dataAcesso: "desc" },
        take: 5,
    });

    if (logs.length === 0) {
        console.log("❌ Nenhum log encontrado.");
    } else {
        console.table(logs.map(l => ({
            ID: l.id,
            Usuario: l.emailUsuario,
            Data: l.dataAcesso.toLocaleString(),
            UserAgent: l.userAgent?.substring(0, 20) + "..."
        })));
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
