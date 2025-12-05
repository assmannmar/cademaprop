export default async function handler(req, res) {
  const url = "https://api.tokkobroker.com/v1/property/?format=json&key=" + process.env.TOKKO_API_KEY;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo datos de Tokko" });
  }
}
