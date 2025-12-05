// api/propiedades.js - (Este código se ejecutará en el servidor de Vercel, no en el navegador)
import fetch from 'node-fetch';

export default async function handler(request, response) {
  // 1. Obtener la clave API de forma segura (Variable de Entorno de Vercel)
  const TOKKO_API_KEY = process.env.TOKKO_API_KEY; 

  try {
    // 2. Llamar a la API de Tokko Broker
    const tokkoResponse = await fetch(`https://api.tokkobroker.com/rest/v1/property/?key=${TOKKO_API_KEY}&limit=10`);
    
    // 3. Procesar y devolver los datos
    const data = await tokkoResponse.json();
    response.status(200).json(data);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Fallo al obtener propiedades' });
  }
}
