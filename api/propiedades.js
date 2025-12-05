// api/propiedades.js - MODIFICADO PARA PAGINACIÓN
import fetch from 'node-fetch'; // Asegúrate de tener 'node-fetch' si usas Node.js en Vercel

export default async function handler(req, res) {
  // Manejo de CORS (mantenido)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const { operacion, tipo, zona, precio_min, precio_max } = req.query;
  const allProperties = [];
  let nextUrl = null;

  // 1. URL base con el límite deseado (ej. 1000)
  let baseUrl = `https://tokkobroker.com/api/v1/property/?key=${process.env.TOKKO_API_KEY}&format=json&available=true&limit=1000`;

  // 2. Aplicar los filtros dinámicos a la URL base
  if (operacion) baseUrl += `&operation_type=${encodeURIComponent(operacion)}`;
  if (tipo) baseUrl += `&property_type=${encodeURIComponent(tipo)}`;
  if (zona) baseUrl += `&location=${encodeURIComponent(zona)}`;
  if (precio_min) baseUrl += `&price_from=${encodeURIComponent(precio_min)}`;
  if (precio_max) baseUrl += `&price_to=${encodeURIComponent(precio_max)}`;

  // La primera URL a consultar será la base
  nextUrl = baseUrl;

  try {
    // 3. CICLO DE PAGINACIÓN: Mientras haya una URL para la siguiente página
    while (nextUrl) {
      const response = await fetch(nextUrl);
      const data = await response.json();

      // Acumular los resultados
      if (data.objects && Array.isArray(data.objects)) {
        allProperties.push(...data.objects);
      }

      // Obtener la URL de la próxima página
      if (data.meta && data.meta.next) {
        // Tokko devuelve la ruta relativa, así que la completamos con el dominio
        nextUrl = `https://tokkobroker.com${data.meta.next}`;
      } else {
        // Si no hay más páginas, detenemos el ciclo
        nextUrl = null;
      }
    }

    // 4. Devolver la lista COMPLETA de propiedades
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(allProperties);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al conectar y paginar con Tokko' });
  }
}
