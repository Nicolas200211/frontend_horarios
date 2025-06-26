import { useState, useEffect } from 'react';
import { NewCalendar } from "../components/calendar/NewCalendar";
import { getHorarios } from './admin_horarios/horariosService';
import { mapHorariosToCalendarEvents } from '../utils/calendarUtils';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// Define the calendar event type
type CalendarEvent = {
  id: number;
  title: string;
  start: string;
  end: string;
  teacher: string;
  room: string;
  color: string;
};

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
        const response = await getHorarios();
        console.log('Horarios from API:', response);
        
        // Extract the items array from the response
        const horarios = response.items || [];
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
  const handleDateClick = (date: Date) => {
    console.log('Fecha seleccionada:', date);
    // Aquí puedes añadir lógica para manejar el clic en una fecha
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendario de Clases</h1>
          <p className="text-gray-600">Visualiza y gestiona el horario de clases</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          className="w-full md:w-auto"
          onClick={() => console.log('Nuevo horario')}
        >
          Nuevo Horario
        </Button>
        <Button 
          type="default"
          onClick={async () => {
            try {
              console.log('Testing API connection...');
              const response = await getHorarios();
              console.log('API response:', response);
            } catch (error) {
              console.error('Error testing API:', error);
            }
          }}
        >
          Probar Conexión
        </Button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <NewCalendar 
          events={events} 
          onDateClick={handleDateClick}
          initialDate={new Date()}
        />
        )}
      </div>
      
      
        </div>

  );
};

export default Dashboard;
