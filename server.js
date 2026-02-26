const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

/* ================= MONGODB ================= */

mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/bitusdt", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Mongo conectado"))
.catch(err => console.log("❌ Error Mongo:", err));

/* ================= MODELOS ================= */

const usuarioSchema = new mongoose.Schema({
  email: String,
  password: String,
  rol: { type: String, default: "usuario" },
  aprobado: { type: Boolean, default: false }
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

/* ================= ADMIN FIJO ================= */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
const ADMIN_PASS = process.env.ADMIN_PASS || "123456";

/* ================= REGISTRO ================= */

app.post("/api/registro", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) return res.json({ error: "Usuario ya existe" });

    const hash = await bcrypt.hash(password, 10);

    const nuevo = new Usuario({
      email,
      password: hash,
      rol: "usuario",
      aprobado: false
    });

    await nuevo.save();

    res.json({ mensaje: "Registrado correctamente" });

  } catch (err) {
    res.status(500).json({ error: "Error registro" });
  }
});

/* ================= LOGIN ================= */

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // LOGIN ADMIN FIJO
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      return res.json({
        mensaje: "Login admin",
        rol: "admin",
        aprobado: true
      });
    }

    // LOGIN USUARIO
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.json({ error: "Usuario no existe" });

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) return res.json({ error: "Contraseña incorrecta" });

    if (!usuario.aprobado) {
      return res.json({ error: "Usuario no aprobado" });
    }

    res.json({
      mensaje: "Login usuario",
      rol: "usuario",
      aprobado: true
    });

  } catch (err) {
    res.status(500).json({ error: "Error login" });
  }
});

/* ================= VER SOLICITUDES ================= */

app.get("/api/solicitudes", async (req, res) => {
  const pendientes = await Usuario.find({ aprobado: false });
  res.json(pendientes);
});

/* ================= APROBAR ================= */

app.post("/api/aprobar/:id", async (req, res) => {
  await Usuario.findByIdAndUpdate(req.params.id, { aprobado: true });
  res.json({ mensaje: "Usuario aprobado" });
});

/* ================= RECHAZAR ================= */

app.post("/api/rechazar/:id", async (req, res) => {
  await Usuario.findByIdAndDelete(req.params.id);
  res.json({ mensaje: "Usuario rechazado" });
});

/* ================= INICIAR ================= */

app.listen(PORT, () => {
  console.log("🚀 Servidor corriendo en puerto", PORT);
});
