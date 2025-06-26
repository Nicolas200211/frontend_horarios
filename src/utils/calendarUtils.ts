import type { Horario } from '../admin/admin_horarios/types';
import type { CalendarEvent as BaseCalendarEvent } from '../components/calendar/Calendar';

// Extend the base CalendarEvent type to include rawData
interface CalendarEvent extends BaseCalendarEvent {
  rawData?: Horario;
}

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
  'domingo': 0,    // 0
  'lunes': 1,       // 1
  'martes': 2,      // 2
  'miércoles': 3,   // 3
  'miercoles': 3,   // 3 - Alternative spelling without accent
  'jueves': 4,      // 4
  'viernes': 5,     // 5
  'sábado': 6,      // 6
  'sabado': 6       // 6 - Alternative spelling without accent
};

// Helper function to get the next occurrence of a day of the week
const getNextDayOfWeek = (dayName: string, referenceDate: Date = new Date()): Date => {
  const dayIndex = DAYS_MAP[dayName.toLowerCase().trim()];
  if (dayIndex === undefined) return new Date();
  
  const result = new Date(referenceDate);
  result.setHours(0, 0, 0, 0);
  
  const currentDay = referenceDate.getDay();
  let daysToAdd = (dayIndex - currentDay + 7) % 7;
  
  // If it's the same day, show next week's occurrence
  if (daysToAdd === 0 && referenceDate > new Date()) {
    daysToAdd = 7;
  }
  
  result.setDate(referenceDate.getDate() + daysToAdd);
  return result;
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
  
  // Use fecha_clase if available, otherwise fall back to dia for backward compatibility
  const eventDate = horario.fecha_clase 
    ? new Date(horario.fecha_clase) 
    : getNextDayOfWeek(horario.dia || 'lunes');
    
  const startTime = formatTimeString(horario.hora_inicio);
  const endTime = formatTimeString(horario.hora_fin);
  
  // Parse hours and minutes from time strings
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Set the time for the event date
  const startDateTime = new Date(eventDate);
  startDateTime.setHours(startHour, startMinute, 0, 0);
  
  const endDateTime = new Date(eventDate);
  endDateTime.setHours(endHour, endMinute, 0, 0);
  
  // Format the date parts from the eventDate
  const year = eventDate.getFullYear();
  const month = String(eventDate.getMonth() + 1).padStart(2, '0');
  const day = String(eventDate.getDate()).padStart(2, '0');
  
  // Create the event with proper date formatting
  return {
    id: horario.id,
    title: horario.curso?.nombre || `Curso ${horario.curso_id}`,
    start: `${year}-${month}-${day}T${startTime}`,
    end: `${year}-${month}-${day}T${endTime}`,
    teacher: horario.profesor ? `${horario.profesor.nombres} ${horario.profesor.apellidos}` : 'Sin profesor',
    room: horario.aula?.nombre || `Aula ${horario.aula_id}`,
    color: COLORS[colorIndex],
    rawData: horario // Include the raw data for reference
  };
};

export const mapHorariosToCalendarEvents = (horarios: Horario[]): CalendarEvent[] => {
  return horarios.map(mapHorarioToCalendarEvent);
};
