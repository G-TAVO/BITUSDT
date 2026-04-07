// ========================= ACTIVAR ENV =========================
require("dotenv").config();

// ========================= CONFIG =========================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));


// ========================= CONEXIÓN MONGO =========================
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Conectado"))
.catch(err => console.log("Error DB:", err));


// ========================= MODELOS =========================
const User = mongoose.model("usuarios", new mongoose.Schema({
  email: String,
  password: String,
  saldo: { type: Number, default: 0 },
  dias: { type: Number, default: 0 },
  nequi: { type: String, default: "" },
}));

const Historial = mongoose.model("historial", new mongoose.Schema({
  email: String,
  monto: Number,
  fecha: String
}));


// ========================= REGISTRO =========================
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existe = await User.findOne({ email });
    if (existe) return res.json({ ok: false, msg: "El usuario ya existe" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({ email, password: hashed });

    res.json({ ok: true });

  } catch {
    res.json({ ok: false });
  }
});


// ========================= LOGIN =========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: false });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ ok: false });

    res.json({
      ok: true,
      user
    });

  } catch {
    res.json({ ok: false });
  }
});


// ========================= PRÉSTAMO =========================
app.post("/api/solicitar-prestamo", async (req, res) => {
  try {
    const { email, monto } = req.body;

    const user = await User.findOne({ email });

    if (user.saldo > 0) {
      return res.json({ ok: false, msg: "Ya tienes préstamo" });
    }

    await User.updateOne({ email }, {
      saldo: monto,
      dias: 30
    });

    await Historial.create({
      email,
      monto,
      fecha: new Date().toLocaleString()
    });

    res.json({ ok: true });

  } catch {
    res.json({ ok: false });
  }
});


// ========================= HISTORIAL =========================
app.get("/api/historial-prestamos/:email", async (req, res) => {
  const data = await Historial.find({ email: req.params.email }).sort({ _id: -1 });
  res.json(data);
});


// ========================= SERVER =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor en puerto", PORT));
