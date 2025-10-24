// Utilitários para lidar com timezone brasileiro (GMT-3)

/**
 * Obtém a data/hora atual no fuso horário brasileiro (America/Sao_Paulo)
 * Retorna um timestamp que quando salvo no banco, será exibido corretamente no Brasil
 */
export function getBrazilianTime(): Date {
  // Simplesmente retorna a hora UTC real do sistema
  // O PostgreSQL salva timestamps em UTC e o frontend faz a conversão para exibição
  return new Date();
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
  // Pega a data atual no timezone do Brasil
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const parts = formatter.formatToParts(new Date());
  const partObj = parts.reduce((obj, part) => {
    obj[part.type] = part.value;
    return obj;
  }, {} as any);
  
  // Retorna no formato YYYY-MM-DD
  return `${partObj.year}-${partObj.month}-${partObj.day}`;
}

/**
 * Converte uma string datetime-local (YYYY-MM-DDTHH:MM) para um Date UTC
 * assumindo que a string está no timezone brasileiro
 */
export function convertLocalToUTC(localDateTimeString: string): Date {
  if (!localDateTimeString) return new Date();
  
  // Parse da string local (formato: "2025-10-24T08:00")
  const [datePart, timePart] = localDateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  
  // Criar string no formato que o Date reconhece como timezone brasileiro
  // Usamos Intl para obter o offset correto
  const localDate = new Date(year, month - 1, day, hour, minute, 0);
  
  // Obter o offset do Brasil em relação ao UTC (geralmente -3 horas, -180 minutos)
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
  
  // Criar a data no timezone do Brasil
  const brazilDate = new Date(year, month - 1, day, hour, minute, 0);
  
  // Obter offset em minutos
  const utcDate = new Date(brazilDate.toLocaleString('en-US', { timeZone: 'UTC' }));
  const brDate = new Date(brazilDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const offset = (utcDate.getTime() - brDate.getTime());
  
  // Aplicar offset para converter para UTC
  return new Date(brazilDate.getTime() - offset);
}

/**
 * Converte uma data UTC para o formato datetime-local (YYYY-MM-DDTHH:MM)
 * no timezone brasileiro para usar em inputs HTML
 */
export function formatToDateTimeLocal(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  
  // Converter para hora do Brasil
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(date);
  const partObj = parts.reduce((obj, part) => {
    obj[part.type] = part.value;
    return obj;
  }, {} as any);
  
  // Retornar no formato YYYY-MM-DDTHH:MM
  return `${partObj.year}-${partObj.month}-${partObj.day}T${partObj.hour}:${partObj.minute}`;
}