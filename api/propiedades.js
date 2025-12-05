// api/propiedades.js (VERSIÓN DEBUG)
export default async function handler(req, res) {
  try {
    const url = `https://tokkobroker.com/api/v1/property/?key=${process.env.TOKKO_API_KEY}&format=json&page=1`;
    const r = await fetch(url);
    const data = await r.json();

    console.log("TOKKO RESPUESTA:", data);  // LOG IMPORTANTE

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
