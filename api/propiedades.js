// api/propiedades.js

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const { operacion, tipo, zona, precio_min, precio_max } = req.query;

  let baseUrl = `https://tokkobroker.com/api/v1/property/?key=${process.env.TOKKO_API_KEY}&format=json&available=true`;

  if (operacion) baseUrl += `&operation_type=${encodeURIComponent(operacion)}`;
  if (tipo) baseUrl += `&property_type=${encodeURIComponent(tipo)}`;
  if (zona) baseUrl += `&location=${encodeURIComponent(zona)}`;
  if (precio_min) baseUrl += `&price_from=${encodeURIComponent(precio_min)}`;
  if (precio_max) baseUrl += `&price_to=${encodeURIComponent(precio_max)}`;

  try {
    let pagina = 1;
    let acumulado = [];
    let seguir = true;

    while (seguir) {
      const url = `${baseUrl}&page=${pagina}`;
      const r = await fetch(url);
      const data = await r.json();

      const objetos = data.objects || data;

      if (!objetos || objetos.length === 0) {
        seguir = false;
        break;
      }

      acumulado = [...acumulado, ...objetos];
      pagina++;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(acumulado);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al conectar con Tokko' });
  }
}

