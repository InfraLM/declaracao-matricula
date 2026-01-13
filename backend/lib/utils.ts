import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BASE_PATH = process.env.NODE_ENV === 'production' ? '/gerador-matricula' : '';

/**
 * Retorna o objeto Date atual ajustado para o fuso de São Paulo (GMT-3).
 * Útil para logs que precisam ser lidos diretamente no banco de dados com horário local.
 */
export function getSaoPauloDate(): Date {
  const now = new Date();
  // Brasília está em GMT-3. Subtraímos 3 horas (3 * 3600 * 1000 ms) do timestamp absoluto.
  // Isso faz com que o Prisma salve o valor literal correspondente ao horário de SP.
  return new Date(now.getTime() - (3 * 60 * 60 * 1000));
}
