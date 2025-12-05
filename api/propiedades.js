export default async function handler(req, res) {
  try {
    const apiKey = process.env.TOKKO_API_KEY;

    const response = await fetch(
      `https://www.tokkobroker.com/api/v1/property/?key=${apiKey}&format=json`
    );

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Error conectando a Tokko" });
  }
}
