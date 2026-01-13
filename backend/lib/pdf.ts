import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

/**
 * Formats a Date object to a long string in Portuguese.
 * Example: "09 de janeiro de 2026"
 */
function formatarDataExtenso(date: Date): string {
    const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];

    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const ano = date.getFullYear();

    return `${dia} de ${mes} de ${ano}`;
}

/**
 * Ensures CPF is in the XXX.XXX.XXX-XX format.
 */
function formatarCPF(cpf: string): string {
    const numeros = cpf.replace(/\D/g, "");
    // Pad if needed, although it should be normalized already
    const padded = numeros.padStart(11, '0');
    return padded.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

interface DadosAluno {
    nome: string;
    cpf: string;
    turma: string;
    status: string;
    dataMatricula: string;
}

/**
 * Generates the Enrollment Declaration PDF based on the exact project model.
 */
export async function gerarDeclaracaoPDF(dados: DadosAluno): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size

    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const { width, height } = page.getSize();
    const margin = 70;
    const fontSize = 12;
    const lineHeight = 20;

    // --- EMBED ASSETS ---
    const assetsDir = path.join(process.cwd(), "public", "assets");

    // Watermark (Background Logo)
    let watermarkImage;
    try {
        const watermarkPath = path.join(assetsDir, "watermark.png");
        if (fs.existsSync(watermarkPath)) {
            const watermarkBytes = fs.readFileSync(watermarkPath);
            watermarkImage = await pdfDoc.embedPng(watermarkBytes);
        }
    } catch (e) {
        console.error("Error loading watermark:", e);
    }

    // Signature
    let signatureImage;
    try {
        const signaturePath = path.join(assetsDir, "signature.png");
        if (fs.existsSync(signaturePath)) {
            const signatureBytes = fs.readFileSync(signaturePath);
            signatureImage = await pdfDoc.embedPng(signatureBytes);
        }
    } catch (e) {
        console.error("Error loading signature:", e);
    }

    // --- DRAW BACKGROUND ---
    if (watermarkImage) {
        // Large circular logo in center - Subtler and smaller
        const wWidth = width * 0.7; // 70% of width
        const wHeight = (watermarkImage.height / watermarkImage.width) * wWidth;
        page.drawImage(watermarkImage, {
            x: (width - wWidth) / 2,
            y: (height - wHeight) / 2,
            width: wWidth,
            height: wHeight,
            opacity: 0.12, // Much more transparent for legibility
        });
    }

    let y = height - margin - 40; // Start a bit lower on page

    // Título
    const titulo = "DECLARAÇÃO DE MATRÍCULA";
    const tituloWidth = fontBold.widthOfTextAtSize(titulo, 14);
    page.drawText(titulo, {
        x: (width - tituloWidth) / 2,
        y,
        size: 14,
        font: fontBold,
        color: rgb(0, 0, 0),
    });

    y -= lineHeight * 2;

    // Subtítulo
    const subtitulo = "Cursos Presenciais e/ou Virtuais";
    const subtituloWidth = fontItalic.widthOfTextAtSize(subtitulo, 12);
    page.drawText(subtitulo, {
        x: (width - subtituloWidth) / 2,
        y,
        size: 12,
        font: fontItalic,
        color: rgb(0, 0, 0),
    });

    y -= lineHeight * 4;

    // --- DATE LOGIC ---
    // Sempre usar a data de matrícula do aluno para todas as turmas
    const dataInicio = dados.dataMatricula;

    // Corpo do texto
    const cpfFormatado = formatarCPF(dados.cpf);
    const dataEmissao = formatarDataExtenso(new Date());

    // --- TEXT LOGIC ---
    const statusUpper = (dados.status || "").toUpperCase();
    const matriculaText = statusUpper === "TRANCADO"
        ? "encontra-se com a matrícula TRANCADA"
        : "está devidamente matriculado(a)";

    // Exact text from model with status variation
    const textoParaQuebrar1 = `Declaramos para os devidos fins que ${dados.nome} sob CPF ${cpfFormatado} ${matriculaText} em um curso de Pós-Graduação Lato Sensu, que se refere às duas pós-graduações "Pós graduação de Medicina de Emergência" e "Pós graduação de Medicina Intensiva", desde ${dataInicio}. Carga horária de 720 horas, oferecido pela Instituição LIBERDADE MEDICA LTDA.`;

    const textoParaQuebrar2 = `Declaramos ainda, que o Curso obedece ao disposto na Resolução CNE/CES nº 01/2007 e que está devidamente credenciado no Ministério da Educação – MEC.`;

    // Helper to wrap text
    const maxWidth = width - margin * 2;

    function quebrarTexto(texto: string, maxW: number, f: typeof font): string[] {
        const palavras = texto.split(" ");
        const linhas: string[] = [];
        let linhaAtual = "";

        for (const palavra of palavras) {
            const teste = linhaAtual ? `${linhaAtual} ${palavra}` : palavra;
            const largura = f.widthOfTextAtSize(teste, fontSize);

            if (largura <= maxW) {
                linhaAtual = teste;
            } else {
                if (linhaAtual) linhas.push(linhaAtual);
                linhaAtual = palavra;
            }
        }

        if (linhaAtual) linhas.push(linhaAtual);
        return linhas;
    }

    const linhas1 = quebrarTexto(textoParaQuebrar1, maxWidth, font);
    const linhas2 = quebrarTexto(textoParaQuebrar2, maxWidth, font);

    // Drawing paragraphs
    const drawParagraph = (lines: string[]) => {
        for (const linha of lines) {
            page.drawText(linha, {
                x: margin,
                y,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            });
            y -= lineHeight;
        }
    };

    drawParagraph(linhas1);
    y -= lineHeight;
    drawParagraph(linhas2);

    y -= lineHeight * 4;

    // Cidade e data - Align Right
    const cidadeData = `Goiânia, ${dataEmissao}`;
    const cdWidth = font.widthOfTextAtSize(cidadeData, fontSize);
    page.drawText(cidadeData, {
        x: width - margin - cdWidth,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
    });

    // --- SIGNATURES ---
    y = 100;
    if (signatureImage) {
        const sWidth = 260; // Slightly smaller signatures
        const sHeight = (signatureImage.height / signatureImage.width) * sWidth;
        page.drawImage(signatureImage, {
            x: (width - sWidth) / 2,
            y: y,
            width: sWidth,
            height: sHeight,
        });
        y -= 15; // Text below signature image
    }

    const sLabel = "Assinatura da instituição";
    const slWidth = font.widthOfTextAtSize(sLabel, 9);
    page.drawText(sLabel, {
        x: (width - slWidth) / 2,
        y: y,
        size: 9,
        font: font,
    });


    // --- FOOTER ---
    const footerY = 30;
    const cnpj = "CNPJ: 40.070030000199";
    const endereco = "R. 8, 857 - St. Central, Goiânia - GO, 74013-030";

    const cnpjWidth = font.widthOfTextAtSize(cnpj, 8);
    const endWidth = font.widthOfTextAtSize(endereco, 8);

    page.drawText(cnpj, {
        x: (width - cnpjWidth) / 2,
        y: footerY + 10,
        size: 8,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText(endereco, {
        x: (width - endWidth) / 2,
        y: footerY,
        size: 8,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
    });

    return await pdfDoc.save();
}
