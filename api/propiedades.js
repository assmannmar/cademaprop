// api/propiedades.js
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  try {
    let page = 1;
    let acumulado = [];
    let seguir = true;

    while (seguir) {
      const url = `https://tokkobroker.com/api/v1/property/?key=${process.env.TOKKO_API_KEY}&format=json&page=${page}`;
      
      const r = await fetch(url);

      if (!r.ok) {
        console.log("Tokko error en página:", page, await r.text());
        break;
      }

      const data = await r.json();
      const objetos = data.objects || [];

      if (objetos.length === 0) {
        seguir = false;
        break;
      }

      acumulado = [...acumulado, ...objetos];
      page++;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(acumulado);

  } catch (err) {
    console.log("ERROR BACKEND:", err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Error al conectar con Tokko' });
  }
}
