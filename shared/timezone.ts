// Utilitários para lidar com timezone brasileiro (GMT-3)

/**
 * Obtém a data/hora atual ajustada para o fuso horário brasileiro (GMT-3)
 */
export function getBrazilianTime(): Date {
  const now = new Date();
  // Criar uma data ajustada para GMT-3 (São Paulo)
  const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  return brazilTime;
}

/**
 * Converte uma data UTC para o horário brasileiro
 */
export function convertToLocal(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return new Date(date.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
}

/**
 * Formata uma data para exibição no formato brasileiro
 */
export function formatBrazilianTime(date: Date | string): string {
  const localDate = convertToLocal(date);
  return localDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Formata uma data para exibição no formato brasileiro
 */
export function formatBrazilianDate(date: Date | string): string {
  const localDate = convertToLocal(date);
  return localDate.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora completa no formato brasileiro
 */
export function formatBrazilianDateTime(date: Date | string): string {
  const localDate = convertToLocal(date);
  return localDate.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Obtém a data no formato YYYY-MM-DD para o fuso brasileiro
 */
export function getBrazilianDateString(): string {
  const brazilTime = getBrazilianTime();
  return brazilTime.toISOString().split('T')[0];
}