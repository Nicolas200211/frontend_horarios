import { useState, useEffect } from 'react';
import { Calendar } from "../components/calendar/Calendar";
import type { CalendarEvent } from "../components/calendar/Calendar";
import { getHorarios } from './admin_horarios/horariosService';
import { API_BASE_URL } from '../config';
import { mapHorariosToCalendarEvents } from '../utils/calendarUtils';

interface DashboardProps {
  // Props can be added here if needed in the future
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        console.log('Fetching horarios...');
        setLoading(true);
        const horarios = await getHorarios();
        console.log('Horarios from API:', horarios);
        
        const calendarEvents = mapHorariosToCalendarEvents(horarios);
        console.log('Mapped calendar events:', calendarEvents);
        
        setEvents(calendarEvents);
        setError(null);
      } catch (err) {
        console.error('Error al cargar los horarios:', err);
        setError('No se pudieron cargar los horarios. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios().catch(err => {
      console.error('Unhandled error in fetchHorarios:', err);
    });
  }, []);
  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendario de Clases</h1>
          <p className="text-gray-600">Visualiza y gestiona el horario de clases</p>
        </div>
        <button 
          onClick={async () => {
            try {
              console.log('Refreshing data...');
              const response = await fetch(`${API_BASE_URL}/api/horarios/`);
              const data = await response.json();
              console.log('Raw API response:', data);
              alert(`API Response: ${JSON.stringify(data, null, 2)}`);
            } catch (error) {
              console.error('Error fetching data:', error);
              alert('Error fetching data. Check console for details.');
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Ver Datos en Crudo
        </button>
      </div>
      
      {/* Calendar Component */}
      <div className="bg-white rounded-lg shadow">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 border-l-4 border-red-500">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(events, null, 2)}
            </pre>
          </div>
        )}
        {loading ? (
          <div className="p-8 text-center">Cargando horarios...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <Calendar events={events} />
        )}
      </div>
      
      
        </div>

  );
};

export default Dashboard;
