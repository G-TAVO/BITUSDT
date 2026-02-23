const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

/* ================== MONGODB ================== */
mongoose.connect(
  process.env.MONGO_URL ||
  "mongodb+srv://Tavo:Enrique1998@cluster0.vuc3y2t.mongodb.net/bitusdt"
)
.then(() => console.log("✅ MongoDB conectado"))
.catch(err => console.log("❌ Error Mongo:", err));

/* ================== MODELOS ================== */

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,

  saldo: { type: Number, default: 0 },
  dias: { type: Number, default: 0 },
  wallet: { type: String, default: "" },

  inversionActiva: { type: Boolean, default: false },
  inversionAprobada: { type: Boolean, default: false },
  montoObjetivo: { type: Number, default: 20 },

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

/* ================= ADMIN ================= */

const ADMIN = {
  email: "Binancecoin958@gmail.com",
  password: "Enriique1998"
};

/* ================= CDT AUTOMÁTICO ================= */

async function actualizarGanancias(user) {
  if (!user.inversionActiva || !user.inversionAprobada) return;

  const ahora = new Date();
  const ultimo = new Date(user.ultimaActualizacion);

  const diasPasados = Math.floor(
    (ahora - ultimo) / (1000 * 60 * 60 * 24)
  );

  if (diasPasados <= 0) return;

  for (let i = 0; i < diasPasados; i++) {
    if (user.saldo < user.montoObjetivo) {
      user.saldo += 0.5;
      user.dias += 1;
    }
  }

  if (user.saldo >= user.montoObjetivo) {
    user.saldo = user.montoObjetivo;
    user.inversionActiva = false;
  }

  user.ultimaActualizacion = ahora;
  await user.save();
}
function iniciarContador(ultimaActualizacion) {
  const INTERVALO = 24 * 60 * 60 * 1000; // 24 horas

  function actualizar() {
    const ahora = new Date().getTime();
    const ultima = new Date(ultimaActualizacion).getTime();
    const proxima = ultima + INTERVALO;
    const restante = proxima - ahora;

    if (restante <= 0) {
      document.getElementById("contador").innerText = "Calculando...";
      return;
    }

    const horas = Math.floor(restante / (1000 * 60 * 60));
    const minutos = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((restante % (1000 * 60)) / 1000);

    document.getElementById("contador").innerText =
      `${horas}h ${minutos}m ${segundos}s`;
  }

  actualizar();
  setInterval(actualizar, 1000);
}
/* ================= REGISTRO ================= */

app.post("/api/register", async (req, res) => {
  const existe = await User.findOne({ email: req.body.email });
  if (existe) return res.json({ ok: false, msg: "Correo ya registrado" });

  const hash = await bcrypt.hash(req.body.password, 10);

  await User.create({
    email: req.body.email,
    password: hash
  });

  res.json({ ok: true, msg: "Registro exitoso" });
});

/* ================= LOGIN ================= */

app.post("/api/login", async (req, res) => {

  // ADMIN
  if (req.body.email === ADMIN.email) {
    if (req.body.password !== ADMIN.password) {
      return res.json({ ok: false, msg: "Clave admin incorrecta" });
    }
    return res.json({ ok: true, rol: "admin" });
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ ok: false, msg: "Usuario no existe" });

  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.json({ ok: false, msg: "Clave incorrecta" });

  await actualizarGanancias(user);

  res.json({
    ok: true,
    rol: "user",
    user: {
      email: user.email,
      saldo: user.saldo,
      dias: user.dias,
      wallet: user.wallet
    }
  });
});

/* ================= INVERTIR ================= */

app.post("/api/invertir", async (req, res) => {
  const u = await User.findOne({ email: req.body.email });
  if (!u) return res.json({ ok:false, msg:"Usuario no existe" });

  if (u.inversionActiva) {
    return res.json({
      ok:false,
      msg:"Ya tienes una inversión activa"
    });
  }

  await Solicitud.create({
    email: u.email,
    monto: Number(req.body.monto),
    estado: "pendiente",
    tipo: "inversion",
    wallet: u.wallet
  });

  res.json({ ok: true, msg: "Inversión enviada, esperando aprobación" });
});

/* ================= SOLICITUDES ADMIN ================= */

app.get("/api/solicitudes", async (req, res) => {
  const sol = await Solicitud.find({ estado: "pendiente" });
  res.json(sol);
});

/* ================= APROBAR ================= */

app.post("/api/aprobar", async (req, res) => {
  const s = await Solicitud.findById(req.body.id);
  if (!s) return res.json({ ok: false });

  const u = await User.findOne({ email: s.email });

  if (s.tipo === "inversion") {
    u.saldo = 0;
    u.dias = 0;
    u.inversionActiva = true;
    u.inversionAprobada = true;
    u.ultimaActualizacion = new Date();
    await u.save();
  }

  s.estado = "aprobado";
  await s.save();

  res.json({ ok: true });
});

/* ================= RETIRAR ================= */

app.post("/api/retirar", async (req, res) => {
  const u = await User.findOne({ email: req.body.email });

  if (u.saldo < u.montoObjetivo || u.inversionActiva) {
    return res.json({
      ok:false,
      msg:"Aún no completas el ciclo"
    });
  }

  await Solicitud.create({
    email: u.email,
    monto: u.saldo,
    estado: "pendiente",
    tipo: "retiro",
    wallet: u.wallet
  });

  u.saldo = 0;
  u.dias = 0;
  u.inversionActiva = false;
  u.inversionAprobada = false;
  await u.save();

  res.json({ ok:true, msg:"Retiro enviado correctamente" });
});

/* ================= WALLET ================= */

app.post("/api/wallet", async (req, res) => {
  const u = await User.findOne({ email: req.body.email });
  if (!u) return res.json({ ok:false, msg:"Usuario no encontrado" });

  u.wallet = req.body.wallet;
  await u.save();

  res.json({ ok:true, msg:"Billetera guardada" });
});

/* ================= SERVER ================= */

app.listen(PORT, () =>
  console.log("🚀 Servidor activo en puerto " + PORT)
);
