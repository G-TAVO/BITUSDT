require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

/* ================== MONGODB ================== */
mongoose.connect(process.env.MONGO_URL)
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

/* ================== JWT MIDDLEWARE ================== */
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ ok:false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ ok:false });
  }
}

function adminOnly(req, res, next) {
  if (req.user.rol !== "admin") return res.status(403).json({ ok:false });
  next();
}

/* ================== GANANCIA ================== */
async function actualizarGanancias(user) {
  const hoy = new Date();
  const ultimo = new Date(user.ultimaActualizacion);
  const dias = Math.floor((hoy - ultimo) / (1000*60*60*24));

  if (dias > 0) {
    user.saldo += dias * 0.5;
    user.dias += dias;
    user.ultimaActualizacion = hoy;
    await user.save();
  }
}

/* ================== REGISTRO ================== */
app.post("/api/register", async (req, res) => {
  const existe = await User.findOne({ email: req.body.email });
  if (existe) return res.json({ ok:false });

  const hash = await bcrypt.hash(req.body.password, 10);
  await User.create({ email:req.body.email, password:hash });

  res.json({ ok:true });
});

/* ================== LOGIN ================== */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // ADMIN
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ email, rol:"admin" }, process.env.JWT_SECRET);
    return res.json({ ok:true, rol:"admin", token });
  }

  // USER
  const user = await User.findOne({ email });
  if (!user) return res.json({ ok:false });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ ok:false });

  await actualizarGanancias(user);

  const token = jwt.sign({ email:user.email, rol:"user" }, process.env.JWT_SECRET);

  res.json({
    ok:true,
    rol:"user",
    token,
    user:{
      email:user.email,
      saldo:user.saldo,
      dias:user.dias,
      wallet:user.wallet
    }
  });
});

/* ================== INVERTIR ================== */
app.post("/api/invertir", auth, async (req, res) => {
  const u = await User.findOne({ email:req.user.email });

  await Solicitud.create({
    email:u.email,
    monto:Number(req.body.monto),
    estado:"pendiente",
    tipo:"inversion",
    wallet:u.wallet
  });

  res.json({ ok:true });
});

/* ================== RETIRAR ================== */
app.post("/api/retirar", auth, async (req, res) => {
  const u = await User.findOne({ email:req.user.email });
  if (u.saldo < 20) return res.json({ ok:false });

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

  res.json({ ok:true });
});

/* ================== WALLET ================== */
app.post("/api/wallet", auth, async (req, res) => {
  const u = await User.findOne({ email:req.user.email });
  u.wallet = req.body.wallet;
  await u.save();
  res.json({ ok:true });
});

/* ================== ADMIN ================== */
app.get("/api/solicitudes", auth, adminOnly, async (req,res)=>{
  res.json(await Solicitud.find({ estado:"pendiente" }));
});

app.post("/api/aprobar", auth, adminOnly, async (req,res)=>{
  const s = await Solicitud.findById(req.body.id);
  const u = await User.findOne({ email:s.email });

  if (s.tipo === "inversion") {
    u.saldo += s.monto;
    u.dias = 0;
    u.ultimaActualizacion = new Date();
    await u.save();
  }

  s.estado = "aprobado";
  await s.save();
  res.json({ ok:true });
});

app.post("/api/rechazar", auth, adminOnly, async (req,res)=>{
  await Solicitud.findByIdAndUpdate(req.body.id, { estado:"rechazado" });
  res.json({ ok:true });
});

/* ================== SERVER ================== */
app.listen(PORT, () => console.log("🚀 Servidor activo"));
