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
  montoInvertido: { type: Number, default: 0 },
  wallet: { type: String, default: "" },
  ultimaActualizacion: { type: Date, default: null },
  inversionActiva: { type: Boolean, default: false }
});

const SolicitudSchema = new mongoose.Schema({
  email: String,
  monto: Number,
  tipo: String, // inversion o retiro
  estado: { type: String, default: "pendiente" }, // pendiente, aprobado, rechazado
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

/* ================= GANANCIA AUTOMÁTICA 5% ================= */
async function actualizarGanancias(user){
  if (!user.inversionActiva || !user.ultimaActualizacion) return;

  const ahora = new Date();
  const horas = Math.floor((ahora - user.ultimaActualizacion) / (1000 * 60 * 60));

  if (horas >= 24) {
    const ciclos = Math.floor(horas / 24);

    const gananciaDiaria = user.montoInvertido * 0.05; // 5% diario

    user.saldo += ciclos * gananciaDiaria;

    user.ultimaActualizacion = new Date(
      user.ultimaActualizacion.getTime() + ciclos * 24 * 60 * 60 * 1000
    );

    await user.save();
  }
}

/* ================= REGISTRO ================= */
app.post("/api/register", async (req,res)=>{
  const { email, password } = req.body;

  const existe = await User.findOne({ email });
  if (existe) return res.json({ ok:false, msg:"Correo ya registrado" });

  const hash = await bcrypt.hash(password,10);
  await User.create({ email, password: hash });

  res.json({ ok:true });
});

/* ================= LOGIN ================= */
app.post("/api/login", async (req,res)=>{
  const { email, password } = req.body;

  if (email === ADMIN.email) {
    if (password !== ADMIN.password)
      return res.json({ ok:false });

    return res.json({ ok:true, rol:"admin" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.json({ ok:false });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.json({ ok:false });

  await actualizarGanancias(user);

  res.json({
    ok:true,
    rol:"user",
    user:{
      email:user.email,
      saldo:user.saldo,
      montoInvertido:user.montoInvertido,
      inversionActiva:user.inversionActiva,
      wallet:user.wallet
    }
  });
});

/* ================= INVERTIR ================= */
app.post("/api/invertir", async (req,res)=>{
  const { email, monto } = req.body;

  const u = await User.findOne({ email });
  if (!u) return res.json({ ok:false });

  await Solicitud.create({
    email,
    monto:Number(monto),
    tipo:"inversion",
    wallet:u.wallet
  });

  res.json({ ok:true, msg:"Enviado a revisión" });
});

/* ================= VER SOLICITUDES PENDIENTES ================= */
app.get("/api/solicitudes", async (req,res)=>{
  const lista = await Solicitud.find({ estado:"pendiente" });
  res.json(lista);
});

/* ================= APROBAR ================= */
app.post("/api/aprobar", async (req,res)=>{
  const s = await Solicitud.findById(req.body.id);
  if (!s || s.estado !== "pendiente")
    return res.json({ ok:false });

  const u = await User.findOne({ email:s.email });
  if (!u) return res.json({ ok:false });

  if (s.tipo === "inversion") {

    u.montoInvertido += s.monto;
    u.inversionActiva = true;

    if (!u.ultimaActualizacion) {
      u.ultimaActualizacion = new Date();
    }

    await u.save();
  }

  if (s.tipo === "retiro") {

    u.montoInvertido = 0;
    u.inversionActiva = false;
    u.ultimaActualizacion = null;
    await u.save();
  }

  s.estado = "aprobado";
  await s.save();

  res.json({ ok:true });
});

/* ================= RECHAZAR ================= */
app.post("/api/rechazar", async (req,res)=>{
  const s = await Solicitud.findById(req.body.id);
  if (!s || s.estado !== "pendiente")
    return res.json({ ok:false });

  s.estado = "rechazado";
  await s.save();

  res.json({ ok:true });
});

/* ================= RETIRAR ================= */
app.post("/api/retirar", async (req,res)=>{
  const u = await User.findOne({ email:req.body.email });
  if (!u) return res.json({ ok:false });

  if (u.saldo < 20)
    return res.json({ ok:false, msg:"Mínimo 20 USDT" });

  await Solicitud.create({
    email:u.email,
    monto:u.saldo,
    tipo:"retiro",
    wallet:u.wallet
  });

  u.saldo = 0;
  await u.save();

  res.json({ ok:true });
});

/* ================= WALLET ================= */
app.post("/api/wallet", async (req,res)=>{
  const u = await User.findOne({ email:req.body.email });
  if (!u) return res.json({ ok:false });

  u.wallet = req.body.wallet;
  await u.save();

  res.json({ ok:true });
});

/* ================= VER USUARIOS ================= */
app.get("/api/usuarios", async (req,res)=>{
  const usuarios = await User.find().select("-password");
  res.json(usuarios);
});

/* ================= SERVER ================= */
app.listen(PORT, ()=>console.log("🚀 Servidor activo"));
