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
 * 
 * Exemplo: "2025-10-23T08:00" no Brasil (UTC-3) = 2025-10-23T11:00:00.000Z
 * 
 * ABORDAGEM SIMPLES: O Brasil está em UTC-3, então adicionamos 3 horas
 */
export function convertLocalToUTC(localDateTimeString: string): Date {
  if (!localDateTimeString) return new Date();
  
  // Parse da string (formato: "2025-10-24T08:00")
  const [datePart, timePart] = localDateTimeString.split('T');
  if (!datePart || !timePart) return new Date();
  
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  
  // Criar Date usando UTC diretamente (Date.UTC retorna timestamp UTC)
  // O usuário digitou 08:00 no Brasil (UTC-3)
  // Para salvar em UTC, precisamos ADICIONAR 3 horas: 08:00 + 3 = 11:00 UTC
  const utcTimestamp = Date.UTC(year, month - 1, day, hour + 3, minute, 0, 0);
  
  return new Date(utcTimestamp);
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