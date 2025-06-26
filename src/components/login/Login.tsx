import { useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { FaGraduationCap, FaUserGraduate, FaLock, FaEnvelope, FaQuestionCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (token: string, userData?: any) => void;
}

const Login: FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loginWithEmail, setLoginWithEmail] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validar que se haya proporcionado al menos un identificador
    if (!username && !email) {
      setError('Por favor ingresa tu nombre de usuario o correo electrónico');
      setLoading(false);
      return;
    }
    
    if (!password) {
      setError('Por favor ingresa tu contraseña');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Intentando iniciar sesión con:', { username, email });
      
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...(username && { username }),  // Incluir username solo si tiene valor
          ...(email && { email }),        // Incluir email solo si tiene valor
          password 
        }),
      });

      console.log('Respuesta del servidor:', response);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error en la respuesta:', errorData);
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const data = await response.json();
      console.log('Datos de la respuesta:', data);

      if (data.access_token) {
        // Guardamos el token JWT
        console.log('Token recibido del servidor:', data.access_token);
        onLogin(data.access_token, data);
        console.log('Redirigiendo a /dashboard');
        navigate('/dashboard');
      } else {
        console.error('No se recibió el token de acceso en la respuesta:', data);
        throw new Error('No se recibió el token de acceso');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full">
              <FaGraduationCap className="h-10 w-10 text-purple-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">¡Bienvenido de nuevo!</h1>
          <p className="text-blue-100 mt-2">Ingresa a tu cuenta para continuar</p>
        </div>
        
        {/* Form */}
        <div className="p-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg"
            >
              <div className="flex items-center">
                <FaQuestionCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </motion.div>
          )}
          
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setLoginWithEmail(false)}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${!loginWithEmail ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Usuario
              </button>
              <button
                type="button"
                onClick={() => setLoginWithEmail(true)}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${loginWithEmail ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Correo electrónico
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!loginWithEmail ? (
              <div>
                <label htmlFor="username" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaUserGraduate className="mr-2 text-blue-500 flex-shrink-0" />
                  <span>Nombre de usuario</span>
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tu nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserGraduate className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FaEnvelope className="mr-2 text-blue-500 flex-shrink-0" />
                  <span>Correo electrónico</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaLock className="mr-2 text-blue-500 flex-shrink-0" />
                <span>Contraseña</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                  Recordar mi cuenta
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>
            
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="flex items-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ingresando...
                  </>
                ) : (
                  <>
                    <FaUserGraduate className="mr-2" />
                    {isHovered ? '¡Vamos a aprender! 🚀' : 'Iniciar sesión'}
                  </>
                )}
              </span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
