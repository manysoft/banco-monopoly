// Reemplaza esto con tu URL obtenida en Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbw47p0GlRvcEMTe3YfciWGjU5SniyKC1GfxP9kYp8x3JDOIWqHWmKOhLntVuvCAuZz1XA/exec";

let jugadoresG = [];
let jugadorActual = null;

window.onload = function() {
    cargarDatos();
};

function cargarDatos() {
    fetch(`${API_URL}?action=getPlayers`)
        .then(response => response.json())
        .then(data => {
            jugadoresG = data;
            
            // Poblar selector de inicio
            const select = document.getElementById("player-select");
            select.innerHTML = '<option value="">-- Selecciona tu nombre --</option>';
            
            data.forEach(p => {
                select.innerHTML += `<option value="${p.id}">${p.nombre} ($${p.saldo})</option>`;
            });

            // Si ya hay un usuario logueado, actualizar su saldo visualmente
            if (jugadorActual) {
                let actualizado = data.find(p => p.id === jugadorActual.id);
                if (actualizado) {
                    jugadorActual = actualizado;
                    document.getElementById("user-balance").innerText = `$${jugadorActual.saldo}`;
                }
            }
        })
        .catch(error => console.error("Error cargando jugadores:", error));
}

function seleccionarJugador() {
    const idSeleccionado = document.getElementById("player-select").value;
    if (!idSeleccionado) return alert("Por favor selecciona un jugador");

    jugadorActual = jugadoresG.find(p => p.id === idSeleccionado);
    
    document.getElementById("welcome-user").innerText = `¡Hola, ${jugadorActual.nombre}!`;
    document.getElementById("user-balance").innerText = `$${jugadorActual.saldo}`;
    
    // Configurar opciones de destinatarios (excluyéndose a sí mismo + opción Banco)
    const targetSelect = document.getElementById("target-select");
    targetSelect.innerHTML = `<option value="banco">🏦 El Banco</option>`;
    
    jugadoresG.forEach(p => {
        if (p.id !== jugadorActual.id) {
            targetSelect.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
        }
    });

    document.getElementById("user-selection").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
}

function realizarPago() {
    const paraId = document.getElementById("target-select").value;
    const monto = parseFloat(document.getElementById("amount-input").value);
    const concepto = document.getElementById("concept-input").value || "Transferencia";

    if (!monto || monto <= 0) return alert("Ingresa un monto válido");

    const payload = {
        action: "transferir",
        deId: jugadorActual.id,
        paraId: paraId,
        monto: monto,
        concepto: concepto
    };

    fetch(API_URL, {
        method: "POST",
        mode: "no-cors", // Requerido para evitar problemas de CORS simples con Apps Script
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).then(() => {
        alert("¡Transacción realizada con éxito!");
        document.getElementById("amount-input").value = "";
        document.getElementById("concept-input").value = "";
        setTimeout(cargarDatos, 2000); // Dar tiempo a que Google Sheets guarde los datos
    }).catch(error => {
        console.error("Error:", error);
        alert("Hubo un error al procesar la transferencia");
    });
}