// ===========================
//  SERVIDOR PRINCIPAL
// ===========================
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Carpeta con HTML, JS, CSS

// ===========================
// USUARIO FIJO ADMIN
// ===========================
let adminUser = "admin";
let adminPass = "admin123"; // Se puede cambiar desde admin.html

// ===========================
// BASE DE DATOS "SIMULADA"
// (Mientras defines una real)
// ===========================

let prestamos = [];  // [{id, cliente, monto, saldo}]
let abonos = [];     // [{prestamoId, fecha, valor}]

// ===========================
// LOGIN
// ===========================
app.post("/api/login", (req, res) => {
    const { user, pass } = req.body;

    if (user === adminUser && pass === adminPass) {
        return res.json({ ok: true, msg: "Acceso permitido" });
    }

    res.json({ ok: false, msg: "Credenciales incorrectas" });
});

// ===========================
// CAMBIAR CONTRASEÑA ADMIN
// ===========================
app.post("/api/cambiar-pass", (req, res) => {
    const { nueva } = req.body;

    if (!nueva || nueva.length < 4) {
        return res.json({ ok: false, msg: "Contraseña demasiado corta" });
    }

    adminPass = nueva;
    res.json({ ok: true, msg: "Contraseña actualizada" });
});

// ===========================
// REGISTRAR PRÉSTAMO
// ===========================
app.post("/api/prestamo", (req, res) => {
    const { cliente, monto } = req.body;

    if (!cliente || !monto) {
        return res.json({ ok: false, msg: "Datos incompletos" });
    }

    const nuevo = {
        id: prestamos.length + 1,
        cliente,
        monto,
        saldo: monto
    };

    prestamos.push(nuevo);

    res.json({ ok: true, msg: "Préstamo registrado", data: nuevo });
});

// ===========================
// REGISTRAR ABONO (Opción 2)
// ===========================
app.post("/api/abono", (req, res) => {
    const { idPrestamo, valor } = req.body;

    const prestamo = prestamos.find(p => p.id == idPrestamo);

    if (!prestamo) {
        return res.json({ ok: false, msg: "Préstamo no encontrado" });
    }

    prestamo.saldo -= valor;

    abonos.push({
        prestamoId: idPrestamo,
        fecha: new Date(),
        valor
    });

    res.json({ ok: true, msg: "Abono registrado", saldo: prestamo.saldo });
});

// ===========================
// LISTAR PRÉSTAMOS
// ===========================
app.get("/api/prestamos", (req, res) => {
    res.json(prestamos);
});

// ===========================
// LISTAR ABONOS
// ===========================
app.get("/api/abonos", (req, res) => {
    res.json(abonos);
});

// ===========================
// SERVIR EL FRONTEND
// ===========================
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===========================
// INICIAR SERVIDOR
// ===========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT);
});
