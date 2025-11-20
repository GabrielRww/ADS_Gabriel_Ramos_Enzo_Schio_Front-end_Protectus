export function parseBrazilianDate(raw: string): Date | null {
    // Aceita formatos: dd/MM/yyyy ou dd/MM/yyyy HH:mm:ss
    if (!raw || typeof raw !== 'string') return null;
    const [datePart, timePart] = raw.trim().split(' ');
    const parts = datePart.split('/');
    if (parts.length !== 3) return null;
    const [dd, MM, yyyy] = parts.map(p => p.replace(/\D/g, ''));
    const day = Number(dd); const month = Number(MM) - 1; const year = Number(yyyy);
    if (!day || !year || month < 0) return null;
    let hours = 0, minutes = 0, seconds = 0;
    if (timePart) {
        const tParts = timePart.split(':');
        hours = Number(tParts[0]) || 0;
        minutes = Number(tParts[1]) || 0;
        seconds = Number(tParts[2]) || 0;
    }
    const d = new Date(year, month, day, hours, minutes, seconds);
    return isNaN(d.getTime()) ? null : d;
};