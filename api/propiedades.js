// api/propiedades.js - VERSIÓN CORREGIDA Y ROBUSTA

// Usamos require si el entorno de Vercel no tiene fetch globalmente (lo más seguro)
const fetch = require('node-fetch');

// Dominio de tu frontend (para solucionar el error CORS)
const FRONTEND_ORIGIN = 'https://cademaprop.com.ar';

export default async function handler(req, res) {
  // 1. MANEJO DE CORS (CORREGIDO)
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // 2. RECUPERACIÓN DE FILTROS Y VARIABLES
  const TOKKO_API_KEY = process.env.TOKKO_API_KEY;
  if (!TOKKO_API_KEY) {
    console.error("TOKKO_API_KEY no está configurada en Vercel.");
    return res.status(500).json({ error: 'Falta la clave API de Tokko' });
  }

  const { operacion, tipo, zona, precio_min, precio_max } = req.query;
  const allProperties = [];
  let nextUrl = null;

  // 3. URL BASE CON FILTROS Y LÍMITE (Limit=1000 es el máximo para una página)
  let baseUrl = `https://tokkobroker.com/api/v1/property/?key=${TOKKO_API_KEY}&format=json&available=true&limit=1000`;

  // Aplicar filtros a la URL base
  if (operacion) baseUrl += `&operation_type=${encodeURIComponent(operacion)}`;
  if (tipo) baseUrl += `&property_type=${encodeURIComponent(tipo)}`;
  if (zona) baseUrl += `&location=${encodeURIComponent(zona)}`;
  if (precio_min) baseUrl += `&price_from=${encodeURIComponent(precio_min)}`;
  if (precio_max) baseUrl += `&price_to=${encodeURIComponent(precio_max)}`;

  nextUrl = baseUrl; // Empezamos la paginación con la URL filtrada

  try {
    // 4. CICLO DE PAGINACIÓN: Obtener todas las páginas
    while (nextUrl) {
      console.log(`Fetching: ${nextUrl}`);
      const response = await fetch(nextUrl);
      
      if (!response.ok) {
        // Maneja errores 4xx o 5xx de Tokko (p. ej. 401 Unauthorized)
        throw new Error(`Tokko API returned status ${response.status}`);
      }

      const data = await response.json();

      // Acumular los resultados de la página actual
      if (data.objects && Array.isArray(data.objects)) {
        allProperties.push(...data.objects);
      }

      // Preparar la URL para la siguiente página
      if (data.meta && data.meta.next) {
        // Tokko devuelve una ruta relativa, la hacemos absoluta
        nextUrl = `https://tokkobroker.com${data.meta.next}`;
      } else {
        nextUrl = null; // Detener el ciclo
      }
    }

    // 5. Devolver la lista COMPLETA de propiedades (soluciona el "solo 20")
    res.status(200).json(allProperties);

  } catch (err) {
    console.error("Error en la Función Serverless de Vercel:", err.message);
    // Devolver un error 500 si la clave es incorrecta o falla la conexión a Tokko
    res.status(500).json({ error: 'Error al conectar con Tokko o en el servidor', detail: err.message });
  }
}
