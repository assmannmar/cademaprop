
async function loadProperties() {
    const cont = document.getElementById("properties");
    const errorBox = document.getElementById("error");

    try {
        const response = await fetch("api/data.json"); // Ajustá el archivo correcto
        const data = await response.json();

        // Detectar si viene dentro de un objeto
        let props = [];

        if (Array.isArray(data)) {
            props = data;
        } else if (Array.isArray(data.propiedades)) {
            props = data.propiedades;
        } else {
            throw new Error("La API no devuelve un array ni 'propiedades'");
        }

        cont.innerHTML = "";

        props.forEach(p => {
            cont.innerHTML += `
                <div class="card">
                    <h3>${p.titulo || "Propiedad"}</h3>
                    <p><strong>Dirección:</strong> ${p.direccion || "-"}</p>
                    <p><strong>Superficie:</strong> ${p.superficie || "-"}</p>
                    <p><strong>Precio:</strong> ${p.precio || "-"}</p>
                </div>
            `;
        });

    } catch (err) {
        errorBox.innerHTML = `<div class="error">${err.message}</div>`;
        console.error(err);
        document.getElementById("properties").innerHTML = "";
    }
}

loadProperties();
