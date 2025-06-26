import React, { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

// Definición de tipos
export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  teacher: string;
  room: string;
  color: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23 horas
const DAYS = Array.from({ length: 7 }, (_, i) => i); // 0-6 días de la semana

export const Calendar: React.FC<CalendarProps> = ({ events = [] }) => {
  // Estado para la fecha de inicio de la semana y el día seleccionado
  // Usamos weekStartsOn: 1 para que la semana empiece en lunes
  const [weekStart, setWeekStart] = useState<Date>(
    startOfWeek(new Date(), { 
      locale: es,
      weekStartsOn: 1 // Lunes es el primer día de la semana (1)
    })
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Navegación de la semana
  const goToPreviousWeek = () => {
    const newDate = addDays(weekStart, -7);
    setWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = addDays(weekStart, 7);
    setWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setWeekStart(startOfWeek(today, { 
      locale: es,
      weekStartsOn: 1 // Lunes es el primer día de la semana (1)
    }));
  };

  // Obtener eventos para un día y hora específicos
  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter(event => {
      try {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        
        // Check if the event occurs on this day
        const isSameDay = eventStart.getDate() === day.getDate() && 
                         eventStart.getMonth() === day.getMonth() && 
                         eventStart.getFullYear() === day.getFullYear();
        
        // Check if the event is happening during this hour
        const isDuringHour = (eventStart.getHours() <= hour && eventEnd.getHours() >= hour) ||
                           (eventStart.getHours() === hour || eventEnd.getHours() === hour);
        
        return isSameDay && isDuringHour;
      } catch (e) {
        console.error('Error parsing event date:', e);
        return false;
      }
    });
  };

  // Renderizar los días de la semana
  const renderWeekDays = () => {
    return DAYS.map(dayOffset => {
      const day = addDays(weekStart, dayOffset);
      const isSelected = isSameDay(day, selectedDate);
      
      // Get the day name in Spanish
      const dayName = format(day, 'EEEE', { locale: es });
      
      // Verificar que el día de la semana sea correcto
      const expectedDayIndex = (dayOffset + 1) % 7; // 1=Lunes, 2=Martes, ..., 6=Sabado, 0=Domingo
      const currentDayIndex = day.getDay();
      
      // Si no coinciden, ajustar la fecha
      if (currentDayIndex !== expectedDayIndex) {
        const diff = (expectedDayIndex - currentDayIndex + 7) % 7;
        day.setDate(day.getDate() + diff);
      }
      
      return (
        <div 
          key={dayOffset} 
          className={`flex-1 text-center p-2 border-r border-gray-200 ${
            isSelected ? 'bg-blue-50' : ''
          }`}
          onClick={() => setSelectedDate(day)}
        >
          <div className="text-sm font-medium text-gray-600">
            {dayName.charAt(0).toUpperCase() + dayName.slice(1, 3)}
          </div>
          <div className={`text-lg font-semibold mt-1 w-8 h-8 flex items-center justify-center mx-auto rounded-full ${
            isSelected 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-800 hover:bg-gray-100'
          }`}>
            {format(day, 'd')}
          </div>
        </div>
      );
    });
  };

  // Renderizar las horas del día
  const renderTimeColumn = () => {
    return (
      <div className="w-16 flex-shrink-0 border-r border-gray-200">
        {HOURS.map(hour => (
          <div 
            key={hour} 
            className="h-16 flex items-start justify-end pr-2 text-xs text-gray-500"
          >
            {`${hour}:00`}
          </div>
        ))}
      </div>
    );
  };

  // Renderizar la cuadrícula de eventos
  const renderTimeGrid = () => {
    return (
      <div className="flex-1 grid grid-cols-7">
        {DAYS.map(dayOffset => {
          const day = addDays(weekStart, dayOffset);
          
          return (
            <div 
              key={dayOffset} 
              className="border-r border-gray-200 relative"
            >
              {HOURS.map(hour => {
                const cellEvents = getEventsForDayAndHour(day, hour);
                const isCurrentHour = new Date().getHours() === hour && isSameDay(day, new Date());
                
                return (
                  <div 
                    key={hour} 
                    className={`h-16 border-b border-gray-100 ${
                      isCurrentHour ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {cellEvents.map((event, index) => (
                      <div
                        key={`${event.id}-${index}`}
                        className={`absolute left-0 right-0 mx-1 p-1 rounded text-xs overflow-hidden ${event.color}`}
                        style={{
                          top: `${(hour * 64) + 2}px`,
                          height: '60px',
                          zIndex: 10,
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs text-gray-700 truncate">{event.teacher}</div>
                        <div className="text-xs text-gray-500">{event.room}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header con navegación */}
      <div className="bg-white rounded-t-lg border border-b-0 border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {format(weekStart, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={goToPreviousWeek}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Semana anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Hoy
            </button>
            <button 
              onClick={goToNextWeek}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Siguiente semana"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Días de la semana */}
        <div className="flex mt-4">
          {renderWeekDays()}
        </div>
      </div>
      
      {/* Calendario */}
      <div className="flex-1 bg-white rounded-b-lg border border-t-0 border-gray-200 overflow-auto">
        <div className="flex">
          {renderTimeColumn()}
          <div className="flex-1 overflow-x-auto">
            {renderTimeGrid()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
