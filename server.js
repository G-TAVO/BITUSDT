
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let users = [];

// Registro
app.post("/register", (req, res) => {
  const { phone, password } = req.body;
  users.push({ phone, password, balance: 0, profit: 0 });
  res.json({ message: "Usuario registrado" });
});

// Depositar
app.post("/deposit", (req, res) => {
  const { phone, amount } = req.body;
  let user = users.find(u => u.phone === phone);
  if(!user) return res.status(404).json({error:"No existe"});
  user.balance += amount;
  res.json({ message: "Depósito exitoso", balance: user.balance });
});

// Simular ganancias diarias
app.post("/profit", (req, res) => {
  const { phone } = req.body;
  let user = users.find(u => u.phone === phone);
  if(!user) return res.status(404).json({error:"No existe"});
  let gain = user.balance * 0.05;
  user.profit += gain;
  res.json({ gain, total: user.profit });
});

// Retiro
app.post("/withdraw", (req, res) => {
  const { phone } = req.body;
  let user = users.find(u => u.phone === phone);
  if(!user) return res.status(404).json({error:"No existe"});

  if(user.profit < 20){
    return res.json({error:"Mínimo retiro 20 USDT"});
  }

  let fee = user.profit * 0.05;
  let pay = user.profit - fee;
  user.profit = 0;

  res.json({ message:"Retiro procesado", recibido: pay, comision: fee });
});

app.listen(3000, ()=>{
  console.log("Servidor corriendo en puerto 3000");
});
