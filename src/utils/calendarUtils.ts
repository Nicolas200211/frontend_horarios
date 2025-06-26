import type { Horario } from '../admin/admin_horarios/types';
import type { CalendarEvent } from '../components/calendar/Calendar';

const COLORS = [
  'bg-blue-100 border-l-4 border-blue-500',
  'bg-green-100 border-l-4 border-green-500',
  'bg-yellow-100 border-l-4 border-yellow-500',
  'bg-purple-100 border-l-4 border-purple-500',
  'bg-pink-100 border-l-4 border-pink-500',
  'bg-indigo-100 border-l-4 border-indigo-500',
];

// Mapeo de nombres de días a números de día de la semana (0-6, donde 0 es domingo)
const DAYS_MAP: Record<string, number> = {
  'domingo': 0,
  'lunes': 1,
  'martes': 2,
  'miércoles': 3,
  'jueves': 4,
  'viernes': 5,
  'sábado': 6,
};

// Helper function to format date string to YYYY-MM-DD format
const formatDateString = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Check if it's a day name
  const dayName = dateStr.toLowerCase().trim();
  if (dayName in DAYS_MAP) {
    const today = new Date();
    const currentDay = today.getDay();
    const targetDay = DAYS_MAP[dayName];
    
    // Calculate the next occurrence of this day
    const diff = (targetDay + 7 - currentDay) % 7 || 7;
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + diff);
    
    const year = nextDay.getFullYear();
    const month = String(nextDay.getMonth() + 1).padStart(2, '0');
    const day = String(nextDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Try to parse other date formats if needed
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  console.error('Invalid date format:', dateStr);
  return '';
};

// Helper function to ensure time is in HH:MM format
const formatTimeString = (timeStr: string): string => {
  if (!timeStr) return '00:00';
  
  // If it's already in HH:MM format, return as is
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  
  // Try to parse other time formats if needed
  const [hours = '00', minutes = '00'] = timeStr.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

export const mapHorarioToCalendarEvent = (horario: Horario): CalendarEvent => {
  // Get a consistent color based on the curso ID or use a default
  const colorIndex = horario.curso_id ? horario.curso_id % COLORS.length : 0;
  
  const formattedDate = formatDateString(horario.dia);
  const startTime = formatTimeString(horario.hora_inicio);
  const endTime = formatTimeString(horario.hora_fin);
  
  return {
    id: horario.id,
    title: horario.curso?.nombre || 'Sin nombre',
    start: formattedDate ? `${formattedDate}T${startTime}` : new Date().toISOString(),
    end: formattedDate ? `${formattedDate}T${endTime}` : new Date().toISOString(),
    teacher: horario.profesor?.nombres || 'Sin profesor',
    room: horario.aula?.codigo || 'Sin aula',
    color: COLORS[colorIndex],
  };
};

export const mapHorariosToCalendarEvents = (horarios: Horario[]): CalendarEvent[] => {
  return horarios.map(mapHorarioToCalendarEvent);
};
