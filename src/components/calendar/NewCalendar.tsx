import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  teacher: string;
  room: string;
  color: string;
}

interface NewCalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  initialDate?: Date;
}

export const NewCalendar: React.FC<NewCalendarProps> = ({
  events = [],
  onDateClick,
  initialDate = new Date()
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  // Navegación del mes
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  // Obtener días del mes actual
  const daysInMonth = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes como primer día
    const endDate = addDays(monthEnd, 6 - monthEnd.getDay()); // Asegurar que termine en domingo

    const days = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }

    return days;
  }, [currentMonth]);

  // Agrupar días por semana
  const weeks = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < daysInMonth.length; i += 7) {
      weeks.push(daysInMonth.slice(i, i + 7));
    }
    return weeks;
  }, [daysInMonth]);

  // Obtener eventos para un día específico
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, day);
    });
  };

  // Nombres de los días de la semana
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header del calendario */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
          >
            Hoy
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {dayNames.map((day) => (
          <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="bg-gray-200 grid grid-cols-7 gap-px">
        {weeks.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                onClick={() => {
                  setSelectedDate(day);
                  onDateClick?.(day);
                }}
                className={`min-h-24 p-2 bg-white ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${
                  isSelected ? 'ring-2 ring-blue-500 z-10' : ''
                } hover:bg-gray-50 cursor-pointer`}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-sm rounded-full ${
                      isDayToday ? 'bg-blue-100 text-blue-600 font-medium' : ''
                    } ${isSelected ? 'bg-blue-600 text-white font-medium' : ''}`}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 flex-1 overflow-y-auto">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 mb-1 rounded truncate ${event.color || 'bg-blue-100 text-blue-800'}`}
                        title={`${event.title} - ${event.teacher} (${event.room})`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-75 truncate">{event.teacher}</div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">+{dayEvents.length - 2} más</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NewCalendar;
