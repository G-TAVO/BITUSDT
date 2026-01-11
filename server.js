const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Base de datos temporal (demo)
let users = [];

// ===============================
// UTILIDADES
// ===============================
const findUser = (phone) => {
  return users.find(u => u.phone === phone);
};

// ===============================
// RUTA TEST
// ===============================
app.get("/", (req, res) => {
  res.send("API BITUSDT funcionando correctamente");
});

app.get("/register", (req, res) => {
  res.send("Ruta activa. Usa POST para registrar usuarios.");
});

// ===============================
// REGISTRO
// ===============================
app.post("/register", (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      error: "Phone y password son obligatorios"
    });
  }

  if (findUser(phone)) {
    return res.status(409).json({
      error: "Usuario ya existe"
    });
  }

  const newUser = {
    phone,
    password,
    balance: 0,
    profit: 0,
    createdAt: new Date()
  };

  users.push(newUser);

  res.status(201).json({
    message: "Usuario registrado correctamente",
    user: {
      phone: newUser.phone,
      balance: newUser.balance
    }
  });
});

// ===============================
// DEPOSITO
// ===============================
app.post("/deposit", (req, res) => {
  const { phone, amount } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({
      error: "Datos incompletos"
    });
  }

  const user = findUser(phone);
  if (!user) {
    return res.status(404).json({
      error: "Usuario no existe"
    });
  }

  const value = Number(amount);
  if (value <= 0) {
    return res.status(400).json({
      error: "Monto inválido"
    });
  }

  user.balance += value;

  res.json({
    message: "Depósito exitoso",
    nuevo_saldo: user.balance
  });
});

// ===============================
// GANANCIAS DIARIAS
// ===============================
app.post("/profit", (req, res) => {
  const { phone } = req.body;

  const user = findUser(phone);
  if (!user) {
    return res.status(404).json({
      error: "Usuario no existe"
    });
  }

  const rate = 0.05; // 5%
  const gain = user.balance * rate;

  user.profit += gain;

  res.json({
    ganancia_hoy: gain,
    total_ganado: user.profit
  });
});

// ===============================
// RETIRO
// ===============================
app.post("/withdraw", (req, res) => {
  const { phone } = req.body;

  const user = findUser(phone);
  if (!user) {
    return res.status(404).json({
      error: "Usuario no existe"
    });
  }

  if (user.profit < 20) {
    return res.status(400).json({
      error: "Mínimo retiro: 20 USDT"
    });
  }

  const fee = user.profit * 0.05;
  const pay = user.profit - fee;

  user.profit = 0;

  res.json({
    message: "Retiro procesado",
    enviado: pay,
    comision_empresa: fee
  });
});

// ===============================
app.listen(3000, () => {
  console.log("Servidor BITUSDT corriendo en puerto 3000");
});
