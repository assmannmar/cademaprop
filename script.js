async function loadProperties() {
  const res = await fetch('/api/propiedades');
  const data = await res.json();

  console.log("Datos Tokko:", data);
}

loadProperties();
