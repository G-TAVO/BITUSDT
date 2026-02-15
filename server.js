const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

/* ================== MONGODB ================== */

mongoose.connect(
  process.env.MONGO_URL
)
.then(() => console.log("✅ MongoDB conectado"))
.catch(err => console.log("❌ Error Mongo:", err));

/* ================== MODELOS ================== */

const UserSchema = new mongoose.Schema({
  nombre: { type: String, default: "" },
  email: { type: String, unique: true },
  password: String,
  saldo: { type: Number, default: 0 },
  dias: { type: Number, default: 0 },
  wallet: { type: String, default: "" },
  ultimaActualizacion: { type: Date, default: Date.now }
});

const SolicitudSchema = new mongoose.Schema({
  email: String,
  monto: Number,
  estado: String,
  tipo: String,
  wallet: String,
  fecha: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Solicitud = mongoose.model("Solicitud", SolicitudSchema);

/* ================= ADMIN SEGURO ================= */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;

/* ================= VALIDACIONES ================= */

function validarEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizarTexto(texto){
  return texto.trim();
}

/* ================= GANANCIA DIARIA ================= */

async function actualizarGanancias(user) {

  const hoy = new Date();
  const ultimo = new Date(user.ultimaActualizacion);

  const diasPasados = Math.floor(
    (hoy - ultimo) / (1000 * 60 * 60 * 24)
  );

  if (diasPasados > 0) {
    user.saldo += diasPasados * 0.5;
    user.dias += diasPasados;
    user.ultimaActualizacion = hoy;
    await user.save();
  }
}

/* ================= REGISTRO ================= */

app.post("/api/register", async (req, res) => {

  try {

    const email = sanitizarTexto(req.body.email);
    const nombre = sanitizarTexto(req.body.nombre);
    const password = req.body.password;

    if(!validarEmail(email))
      return res.json({ ok:false, msg:"Email inválido" });

    if(password.length < 6)
      return res.json({ ok:false, msg:"Mínimo 6 caracteres" });

    const existe = await User.findOne({ email });
    if (existe)
      return res.json({ ok:false, msg:"Correo ya registrado" });

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      nombre,
      email,
      password: hash
    });

    res.json({ ok:true, msg:"Registro exitoso" });

  } catch (err) {
    res.json({ ok:false, msg:"Error servidor" });
  }
});

/* ================= LOGIN ================= */

app.post("/api/login", async (req, res) => {

  try {

    const email = sanitizarTexto(req.body.email);
    const password = req.body.password;

    // ADMIN
    if(email === ADMIN_EMAIL){
      if(password !== ADMIN_PASS)
        return res.json({ ok:false, msg:"Clave admin incorrecta" });

      return res.json({ ok:true, rol:"admin" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ ok:false, msg:"Usuario no existe" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.json({ ok:false, msg:"Clave incorrecta" });

    await actualizarGanancias(user);

    res.json({
      ok:true,
      rol:"user",
      user:{
        nombre:user.nombre,
        email:user.email,
        saldo:user.saldo,
        dias:user.dias,
        wallet:user.wallet
      }
    });

  } catch (err) {
    res.json({ ok:false, msg:"Error servidor" });
  }
});

/* ================= INVERTIR ================= */

app.post("/api/invertir", async (req, res) => {

  const monto = Number(req.body.monto);

  if(isNaN(monto) || monto <= 0)
    return res.json({ ok:false, msg:"Monto inválido" });

  const u = await User.findOne({ email:req.body.email });
  if (!u)
    return res.json({ ok:false, msg:"Usuario no existe" });

  await Solicitud.create({
    email:u.email,
    monto,
    estado:"pendiente",
    tipo:"inversion",
    wallet:u.wallet
  });

  res.json({ ok:true, msg:"Solicitud enviada al admin" });
});

/* ================= RETIRAR ================= */

app.post("/api/retirar", async (req, res) => {

  const u = await User.findOne({ email:req.body.email });
  if (!u)
    return res.json({ ok:false, msg:"Usuario no existe" });

  if(!u.wallet)
    return res.json({ ok:false, msg:"Debe registrar billetera" });

  if (u.saldo < 20)
    return res.json({ ok:false, msg:"Mínimo 20 USDT" });

  await Solicitud.create({
    email:u.email,
    monto:u.saldo,
    estado:"pendiente",
    tipo:"retiro",
    wallet:u.wallet
  });

  u.saldo = 0;
  u.dias = 0;
  await u.save();

  res.json({ ok:true, msg:"Retiro enviado al admin" });
});

/* ================= SERVER ================= */

app.listen(PORT, () =>
  console.log("🚀 Servidor activo en puerto " + PORT)
);
