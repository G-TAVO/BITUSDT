const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* BD TEMPORAL */
let users = [];

console.log("Servidor iniciado...");

/* RUTA PRINCIPAL */
app.get("/", (req, res) => {
  res.send("API BITUSDT ACTIVA");
});

/* GET REGISTER (NAVEGADOR) */
app.get("/register", (req, res) => {
  res.send("Ruta activa. Usa POST para registrar usuarios.");
});

/* POST REGISTER */
app.post("/register", (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      error: true,
      msg: "Faltan datos"
    });
  }

  const existe = users.find(u => u.phone === phone);

  if (existe) {
    return res.status(400).json({
      error: true,
      msg: "Usuario ya existe"
    });
  }

  const nuevo = {
    phone,
    password,
    investment: 0,
    profit: 0
  };

  users.push(nuevo);

  res.json({
    error: false,
    msg: "Registro exitoso",
    user: nuevo
  });
});

/* LOGIN */
app.post("/login", (req, res) => {
  const { phone, password } = req.body;

  const user = users.find(
    u => u.phone === phone && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      error: true,
      msg: "Datos incorrectos"
    });
  }

  res.json({
    error: false,
    msg: "Login correcto",
    user
  });
});

/* INVERTIR */
app.post("/invest", (req, res) => {
  const { phone, amount } = req.body;

  const user = users.find(u => u.phone === phone);
  if (!user) {
    return res.status(404).json({
      error: true,
      msg: "Usuario no existe"
    });
  }

  const montos = [10, 20, 30, 40, 50];
  if (!montos.includes(amount)) {
    return res.status(400).json({
      error: true,
      msg: "Monto inválido"
    });
  }

  user.investment += amount;

  res.json({
    msg: "Inversión exitosa",
    totalInvertido: user.investment
  });
});

/* GANANCIAS */
app.post("/profit", (req, res) => {
  const { phone } = req.body;

  const user = users.find(u => u.phone === phone);
  if (!user) {
    return res.status(404).json({
      error: true,
      msg: "Usuario no existe"
    });
  }

  let daily = 0;

  if (user.investment == 10) daily = 0.5;
  if (user.investment == 20) daily = 2;
  if (user.investment == 30) daily = 4.5;
  if (user.investment == 40) daily = 14;
  if (user.investment == 50) daily = 20;

  user.profit += daily;

  res.json({
    msg: "Ganancia añadida",
    hoy: daily,
    total: user.profit
  });
});

/* RETIRO */
app.post("/withdraw", (req, res) => {
  const { phone } = req.body;

  const user = users.find(u => u.phone === phone);
  if (!user) {
    return res.status(404).json({
      error: true,
      msg: "Usuario no existe"
    });
  }

  if (user.profit < 20) {
    return res.status(400).json({
      error: true,
      msg: "Retiro mínimo 20 USDT"
    });
  }

  const fee = user.profit * 0.05;
  const receive = user.profit - fee;

  user.profit = 0;

  res.json({
    msg: "Retiro exitoso",
    empresa: fee,
    usuario: receive
  });
});

/* DASHBOARD */
app.post("/dashboard", (req, res) => {
  const { phone } = req.body;

  const user = users.find(u => u.phone === phone);
  if (!user) {
    return res.status(404).json({
      error: true,
      msg: "Usuario no existe"
    });
  }

  res.json({
    inversion: user.investment,
    ganancias: user.profit
  });
});

/* START */
app.listen(PORT, () => {
  console.log("Servidor activo en puerto", PORT);
});

