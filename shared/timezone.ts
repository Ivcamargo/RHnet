// Utilitários para lidar com timezone brasileiro (GMT-3)

/**
 * Obtém a data/hora atual no fuso horário brasileiro (America/Sao_Paulo)
 * Retorna um timestamp UTC que representa a hora atual no Brasil
 */
export function getBrazilianTime(): Date {
  // Pega hora atual UTC
  const now = new Date();
  
  // Formata para o timezone do Brasil
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const partObj = parts.reduce((obj, part) => {
    obj[part.type] = part.value;
    return obj;
  }, {} as any);
  
  // Cria string ISO no formato que será interpretado como UTC
  const isoString = `${partObj.year}-${partObj.month}-${partObj.day}T${partObj.hour}:${partObj.minute}:${partObj.second}.000Z`;
  
  // Retorna Date que representa exatamente o horário brasileiro como UTC
  return new Date(isoString);
}

/**
 * Converte uma data UTC para o horário brasileiro
 */
export function convertToLocal(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  
  // Usar Intl.DateTimeFormat para obter o horário correto no timezone brasileiro
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(date);
  const partObj = parts.reduce((obj, part) => {
    obj[part.type] = part.value;
    return obj;
  }, {} as any);
  
  // Criar Date object com horário brasileiro correto
  const localTime = new Date(
    parseInt(partObj.year),
    parseInt(partObj.month) - 1, // Month é 0-indexed
    parseInt(partObj.day),
    parseInt(partObj.hour),
    parseInt(partObj.minute),
    parseInt(partObj.second)
  );
  
  return localTime;
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