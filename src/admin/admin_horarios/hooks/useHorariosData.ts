import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { 
  getAulas, 
  getCursos, 
  getProfesores, 
  getUnidadesAcademicas, 
  getTiposClase,
  getHorarios
} from '../horariosService';
import type { Horario, FiltrosHorario, HorarioListResponse } from '../types';

interface UseHorariosDataProps {
  page: number;
  pageSize: number;
  filters: FiltrosHorario;
}

interface UseHorariosDataReturn {
  data: {
    aulas: any[];
    cursos: any[];
    profesores: any[];
    unidadesAcademicas: any[];
    tiposClase: string[];
    horarios: Horario[];
  };
  loading: boolean;
  error: Error | null;
  loadHorarios: () => Promise<HorarioListResponse>;
  reloadData: () => Promise<HorarioListResponse>;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

export const useHorariosData = ({ page, pageSize, filters }: UseHorariosDataProps): UseHorariosDataReturn => {
  const [data, setData] = useState<{
    aulas: any[];
    cursos: any[];
    profesores: any[];
    unidadesAcademicas: any[];
    tiposClase: string[];
    horarios: Horario[];
  }>({
    aulas: [],
    cursos: [],
    profesores: [],
    unidadesAcademicas: [],
    tiposClase: [],
    horarios: [],
  });
  
  const [pagination, setPagination] = useState({
    current: page,
    pageSize,
    total: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch aulas first to debug
      console.log('Fetching aulas...');
      const aulasData = await getAulas();
      console.log('Aulas data received:', aulasData);
      
      // Then fetch other data in parallel
      const [
        cursosData, 
        profesoresData, 
        unidadesData, 
        tiposData
      ] = await Promise.all([
        getCursos().catch((e: Error) => { console.error('Error cargando cursos:', e); return []; }),
        getProfesores().catch((e: Error) => { console.error('Error cargando profesores:', e); return []; }),
        getUnidadesAcademicas().catch((e: Error) => { console.error('Error cargando unidades académicas:', e); return []; }),
        getTiposClase().catch((e: Error) => { console.error('Error cargando tipos de clase:', e); return []; })
      ]);

      setData(prev => ({
        ...prev,
        aulas: Array.isArray(aulasData) ? aulasData : [],
        cursos: Array.isArray(cursosData) ? cursosData : [],
        profesores: Array.isArray(profesoresData) ? profesoresData : [],
        unidadesAcademicas: Array.isArray(unidadesData) ? unidadesData : [],
        tiposClase: Array.isArray(tiposData) ? tiposData : []
      }));

    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err instanceof Error ? err : new Error('Error al cargar los datos'));
      message.error('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHorarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getHorarios({
        ...filters,
        skip: (page - 1) * pageSize,
        limit: pageSize,
      });
      
      setData(prev => ({
        ...prev,
        horarios: response.items,
      }));
      
      // Actualizar el total de registros
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total: response.total,
      }));
      
      return response;
    } catch (error) {
      console.error('Error loading schedules:', error);
      message.error('Error al cargar los horarios');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await loadInitialData();
        await loadHorarios();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []); // Solo se ejecuta una vez al montar el componente

  return {
    data,
    loading,
    error,
    loadHorarios,
    reloadData: loadHorarios,
    pagination,
  };
};
