const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export interface UnidadAcademica {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  created_at?: string;
  updated_at?: string;
}

const handleResponse = async (response: Response) => {
  console.log('Respuesta del servidor:', {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    headers: Object.fromEntries(response.headers.entries())
  });

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    console.error('Error en la respuesta:', data);
    throw new Error(data.detail || 'Error en la petición');
  }
  
  console.log('Datos de respuesta:', data);
  return data;
};

export const getUnidadesAcademicas = async (): Promise<UnidadAcademica[]> => {
  console.log('Iniciando petición a:', `${API_URL}/unidades-academicas/`);
  try {
    const response = await fetch(`${API_URL}/unidades-academicas/`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en getUnidadesAcademicas:', error);
    throw error;
  }
};

export const createUnidadAcademica = async (unidad: Omit<UnidadAcademica, 'id' | 'created_at' | 'updated_at'>): Promise<UnidadAcademica> => {
  console.log('Creando unidad académica:', unidad);
  const response = await fetch(`${API_URL}/unidades-academicas/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(unidad),
  });
  return handleResponse(response);
};

export const updateUnidadAcademica = async (id: number, unidad: Partial<UnidadAcademica>): Promise<UnidadAcademica> => {
  console.log(`Actualizando unidad académica ${id}:`, unidad);
  const response = await fetch(`${API_URL}/unidades-academicas/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(unidad),
  });
  return handleResponse(response);
};

export const deleteUnidadAcademica = async (id: number): Promise<void> => {
  console.log(`Eliminando unidad académica ${id}`);
  const response = await fetch(`${API_URL}/unidades-academicas/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('Error al eliminar:', error);
    throw new Error(error.detail || 'Error al eliminar la unidad académica');
  }
};
