// api/propiedades.js - SOLUCIÓN FINAL (POST + PAGINACIÓN)

// Usamos require si el entorno de Vercel no tiene fetch globalmente (lo más seguro)
const fetch = require('node-fetch');

// Dominio de tu frontend (para solucionar el error CORS 🛑)
const FRONTEND_ORIGIN = 'https://cademaprop.com.ar';

// Base de la API de Tokko para el endpoint de búsqueda
const TOKKO_API_BASE_SEARCH = 'https://tokkobroker.com/api/v1/property/search/';


export default async function handler(req, res) {
  const TOKKO_API_KEY = process.env.TOKKO_API_KEY;

  // 1. Manejo de CORS
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST'); // Agregamos POST por si acaso
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // 2. Extracción de filtros del frontend (req.query)
  const { operacion, tipo, zona, precio_min, precio_max } = req.query;
  
  // Inicialización para paginación
  const allProperties = [];
  const limit = 500; // Máximo por página
  let offset = 0;
  let more = true;
  
  // Parámetros que van en la URL de búsqueda (los más simples)
  const urlParams = new URLSearchParams({
    lang: 'es_ar',
    format: 'json',
    key: TOKKO_API_KEY
  });
  const baseUrl = `${TOKKO_API_BASE_SEARCH}?${urlParams.toString()}`;

  try {
    // 3. CICLO DE PAGINACIÓN con POST
    while (more) {
      // Objeto de filtros (BODY de la solicitud POST, como en tu código Express)
      const dataBody = {
        current_localization_id: 0,
        current_localization_type: "country",
        price_from: precio_min ? parseFloat(precio_min) : 0, 
        price_to: precio_max ? parseFloat(precio_max) : 99999999,
        
        // Asignar filtros (asumiendo que tu frontend envía los códigos de Tokko)
        operation_types: operacion ? [operacion] : [], 
        property_types: tipo ? [tipo] : [], 
        
        currency: "USD",
        location: zona ? zona : null, 
        filters: [],
        with_tags: [],
        without_tags: [],
        limit,
        offset // El offset cambia en cada iteración
      };

      const response = await fetch(baseUrl, {
        method: 'POST', // 👈 ¡CLAVE para el endpoint /search/!
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataBody)
      });

      if (!response.ok) {
        // Manejo de error de la API de Tokko (ej. clave inválida, error 400)
        const errorText = await response.text();
        console.error("Tokko Error:", errorText);
        return res.status(response.status).json({ error: 'Fallo la API de Tokko', detail: errorText });
      }

      const result = await response.json();
      const objects = result.objects || [];
      allProperties.push(...objects);

      // Lógica de avance
      if (objects.length < limit || objects.length === 0) {
        more = false;
      } else {
        offset += limit;
      }
    }

    // 4. Devolver la lista COMPLETA
    res.status(200).json(allProperties);

  } catch (err) {
    console.error("Error en el servidor:", err.message);
    res.status(500).json({ error: 'Error del servidor', detail: err.message });
  }
}
