// --------------------
// Variables globales
// --------------------

// Inicializar saldo y transacciones desde localStorage
let saldo = Number(localStorage.getItem("saldo")) || 100000;
let transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];

// --------------------
// LOGIN
// --------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (email && password) {
            // Guardar datos de sesión si quieres (opcional)
            sessionStorage.setItem("usuario", email);

            window.location.href = "menu.html";
        } else {
            alert("Por favor ingresa correo y contraseña");
        }
    });
}

// --------------------
// DEPÓSITO
// --------------------
const depositForm = document.getElementById("depositForm");
if (depositForm) {
    depositForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const monto = Number(document.getElementById("amount").value);

        if (monto > 0) {
            saldo += monto;
            transacciones.push("Depósito: $" + monto);

            // Guardar en localStorage
            localStorage.setItem("saldo", saldo);
            localStorage.setItem("transacciones", JSON.stringify(transacciones));

            alert("Depósito realizado con éxito");
            window.location.href = "menu.html";
        } else {
            alert("Ingresa un monto válido");
        }
    });
}

// --------------------
// ENVÍO DE DINERO
// --------------------
const sendForm = document.getElementById("sendForm");
if (sendForm) {
    sendForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const contacto = document.getElementById("contact").value;
        const monto = Number(document.getElementById("sendAmount").value);

        if (contacto && monto > 0 && monto <= saldo) {
            saldo -= monto;
            transacciones.push("Envío a " + contacto + ": $" + monto);

            // Guardar en localStorage
            localStorage.setItem("saldo", saldo);
            localStorage.setItem("transacciones", JSON.stringify(transacciones));

            alert("Dinero enviado con éxito");
            window.location.href = "menu.html";
        } else {
            alert("Revisa los datos: monto mayor a 0, menor o igual al saldo y contacto válido");
        }
    });
}

// --------------------
// MENÚ: Mostrar saldo dinámico
// --------------------
const saldoSpan = document.getElementById("saldo");
if (saldoSpan) {
    saldoSpan.textContent = saldo;

    // Animación con jQuery si está cargado
    if (window.jQuery) {
        $(document).ready(function() {
            $("#saldo").hide().fadeIn(1000);
        });
    }
}

// --------------------
// HISTORIAL DE TRANSACCIONES (transactions.html)
// --------------------
const transactionList = document.getElementById("transactionList");
if (transactionList) {
    // Leer transacciones desde localStorage
    transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];

    transactionList.innerHTML = "";

    if (transacciones.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No hay movimientos aún";
        li.classList.add("list-group-item");
        transactionList.appendChild(li);
    } else {
        transacciones.forEach(function(item) {
            const li = document.createElement("li");
            li.textContent = item;
            li.classList.add("list-group-item");
            transactionList.appendChild(li);
        });
    }
}