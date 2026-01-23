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

/* ================= GANANCIA DIARIA ================= */
// 0.5 USDT diarios
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
    const existe = await User.findOne({ email: req.body.email });
    if (existe) return res.json({ ok: false, msg: "Correo ya registrado" });

    const hash = await bcrypt.hash(req.body.password, 10);

    await User.create({
      email: req.body.email,
      password: hash
    });

    res.json({ ok: true, msg: "Registro exitoso" });
  } catch (err) {
    res.json({ ok: false, msg: "Error servidor" });
  }
});

/* ================= LOGIN ================= */

app.post("/api/login", async (req, res) => {
  try {

    // ADMIN
    if (req.body.email === ADMIN.email) {
      if (req.body.password !== ADMIN.password) {
        return res.json({ ok: false, msg: "Clave admin incorrecta" });
      }
      return res.json({ ok: true, rol: "admin" });
    }

    // USUARIO
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ ok: false, msg: "Usuario no existe" });

    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) return res.json({ ok: false, msg: "Clave incorrecta" });

    await actualizarGanancias(user);

    res.json({ ok: true, rol: "user", user });

  } catch (err) {
    res.json({ ok: false, msg: "Error servidor" });
  }
});

/* ================= INVERTIR ================= */

app.post("/api/invertir", async (req, res) => {
  await Solicitud.create({
    email: req.body.email,
    monto: Number(req.body.monto),
    estado: "pendiente",
    tipo: "inversion"
  });

  res.json({ ok: true, msg: "Solicitud enviada al admin" });
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
    u.saldo += s.monto;
    u.dias = 0;
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

  if (u.saldo < 20) {
    return res.json({ ok: false, msg: "Mínimo 20 USDT" });
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
  await u.save();

  res.json({ ok: true, msg: "Retiro enviado al admin" });
});

/* ================= WALLET ================= */

app.post("/api/wallet", async (req, res) => {
  const u = await User.findOne({ email: req.body.email });
  u.wallet = req.body.wallet;
  await u.save();

  res.json({ ok: true });
});

/* ================= SERVER ================= */

app.listen(PORT, () =>
  console.log("🚀 Servidor activo en puerto " + PORT)
);
