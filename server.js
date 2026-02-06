require("dotenv").config();
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

/* ================= ADMIN ================= */

const ADMIN = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD
};

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
    const existe = await User.findOne({ email: req.body.email });
    if (existe) return res.json({ ok: false, msg: "Correo ya registrado" });

    const hash = await bcrypt.hash(req.body.password, 10);

    await User.create({
      email: req.body.email,
      password: hash
    });

    res.json({ ok: true, msg: "Registro exitoso" });
  } catch {
    res.json({ ok: false, msg: "Error servidor" });
  }
});

/* ================= LOGIN ================= */

app.post("/api/login", async (req, res) => {
  try {

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

  } catch {
    res.json({ ok: false, msg: "Error servidor" });
  }
});

/* ================= SERVER ================= */

app.listen(PORT, () =>
  console.log("🚀 Servidor activo en puerto " + PORT)
);
