// =============================================
// server.js - Servidor principal de BITUSDT
// =============================================

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
const SECRET = process.env.JWT_SECRET;

/* ================== MONGODB ================== */

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.log("❌ Error Mongo:", err));

/* ================== MODELOS ================== */

const UserSchema = new mongoose.Schema({
  userId: String,
  email: { type: String, unique: true },
  password: String,
  nombre: { type: String, default: "" },
  telefono: { type: String, default: "" },
  saldo: { type: Number, default: 0 },
  dias: { type: Number, default: 0 },
  nequi: { type: String, default: "" },
  referidoPor: { type: String, default: "" },
  ultimaActualizacion: { type: Date, default: Date.now },
  cicloActivo: { type: Boolean, default: false },
});

const SolicitudSchema = new mongoose.Schema({
  email: String,
  monto: Number,
  estado: String,
  tipo: String,
  nequi: String,
  fecha: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Solicitud = mongoose.model("Solicitud", SolicitudSchema);

/* ================= MIDDLEWARES ================= */

// Protege rutas que solo puede usar el admin
function soloAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ ok: false, msg: "Sin autorización" });
  try {
    const datos = jwt.verify(token, SECRET);
    if (datos.rol !== "admin") return res.json({ ok: false, msg: "No eres admin" });
    next();
  } catch {
    res.json({ ok: false, msg: "Token inválido o expirado" });
  }
}

// Protege rutas que solo puede usar el usuario dueño
function soloUsuario(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ ok: false, msg: "Sin autorización" });
  try {
    const datos = jwt.verify(token, SECRET);
    req.emailUsuario = datos.email;
    next();
  } catch {
    res.json({ ok: false, msg: "Token inválido o expirado" });
  }
}

/* ================= GANANCIAS ================= */

async function actualizarGanancias(user) {
  const hoy = new Date();
  const ultimo = new Date(user.ultimaActualizacion);
  const diasPasados = Math.floor((hoy - ultimo) / (1000 * 60 * 60 * 24));

  if (diasPasados > 0 && user.saldo > 0) {
    const ganancia = user.saldo * 0.05 * diasPasados; // 5% diario sobre saldo
    user.saldo = Math.round((user.saldo + ganancia) * 100) / 100;
    user.dias += diasPasados;
    user.ultimaActualizacion = hoy;
    await user.save();
  }
}

/* ================= REGISTRO ================= */

app.post("/api/register", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const existe = await User.findOne({ email });
    if (existe) return res.json({ ok: false, msg: "Correo ya registrado" });

    const hash = await bcrypt.hash(req.body.password, 10);
    const totalUsuarios = await User.countDocuments();
    const nuevoId = "USR-" + (1001 + totalUsuarios);

    await User.create({
      userId: nuevoId,
      email,
      password: hash,
      saldo: 0,
      dias: 0,
      referidoPor: req.body.referidoPor || ""
    });

    res.json({ ok: true, msg: "Registro exitoso" });
  } catch (err) {
    res.json({ ok: false, msg: "Error en el registro" });
  }
});

/* ================= LOGIN ================= */

app.post("/api/login", async (req, res) => {
  try {
    const emailIngresado = req.body.email.toLowerCase().trim();
    const claveIngresada = req.body.password;

    // Login admin
    const adminEmail = process.env.ADMIN_EMAIL.toLowerCase();
    if (emailIngresado === adminEmail) {
      const claveOk = await bcrypt.compare(claveIngresada, process.env.ADMIN_PASSWORD_HASH);
      if (!claveOk) return res.json({ ok: false, msg: "Clave admin incorrecta" });

      const token = jwt.sign({ rol: "admin" }, SECRET, { expiresIn: "8h" });
      return res.json({ ok: true, rol: "admin", token });
    }

    // Login usuario
    const user = await User.findOne({ email: emailIngresado });
    if (!user) return res.json({ ok: false, msg: "Usuario no existe" });

    const claveOk = await bcrypt.compare(claveIngresada, user.password);
    if (!claveOk) return res.json({ ok: false, msg: "Clave incorrecta" });

    await actualizarGanancias(user);

    const token = jwt.sign({ email: user.email, rol: "user" }, SECRET, { expiresIn: "8h" });

    res.json({
      ok: true,
      rol: "user",
      token,
      user: {
        userId: user.userId,
        email: user.email,
        saldo: user.saldo,
        dias: user.dias,
        nequi: user.nequi,
        ultimaActualizacion: user.ultimaActualizacion,
      }
    });

  } catch (err) {
    res.json({ ok: false, msg: "Error servidor" });
  }
});

/* ================= INVERTIR ================= */

app.post("/api/invertir", soloUsuario, async (req, res) => {
  try {
    const email = req.emailUsuario;
    const u = await User.findOne({ email });
    if (!u) return res.json({ ok: false, msg: "Usuario no existe" });

    await Solicitud.create({
      email: u.email,
      monto: Number(req.body.monto),
      estado: "pendiente",
      tipo: "inversion",
      nequi: u.nequi,
    });

    res.json({ ok: true, msg: "Solicitud enviada al admin" });
  } catch (err) {
    res.json({ ok: false, msg: "Error servidor" });
  }
});

/* ================= RETIRAR ================= */

app.post("/api/retirar", soloUsuario, async (req, res) => {
  try {
    const email = req.emailUsuario;
    const monto = Number(req.body.monto);
    const u = await User.findOne({ email });

    if (!u) return res.json({ ok: false, msg: "Usuario no existe" });
    if (!u.nequi) return res.json({ ok: false, msg: "Debes registrar tu número de Nequi" });
    if (monto < 20) return res.json({ ok: false, msg: "Mínimo retiro 20 USDT" });
    if (monto > u.saldo) return res.json({ ok: false, msg: "Saldo insuficiente" });

    // Descontar saldo al crear solicitud
    u.saldo = Math.round((u.saldo - monto) * 100) / 100;
    u.cicloActivo = false;
    await u.save();

    await Solicitud.create({
      email: u.email,
      monto,
      estado: "pendiente",
      tipo: "retiro",
      nequi: u.nequi
    });

    res.json({ ok: true, msg: "Solicitud de retiro enviada" });
  } catch (err) {
    res.json({ ok: false, msg: "Error servidor" });
  }
});

/* ================= WALLET ================= */

app.post("/api/wallet", soloUsuario, async (req, res) => {
  try {
    const email = req.emailUsuario;
    const u = await User.findOne({ email });
    if (!u) return res.json({ ok: false, msg: "Usuario no encontrado" });

    u.nequi = req.body.nequi || "";
    await u.save();

    res.json({ ok: true, msg: "Cuenta de retiro guardada correctamente" });
  } catch (err) {
    res.json({ ok: false, msg: "Error servidor" });
  }
});

/* ================= HISTORIAL ================= */

app.get("/api/historial/:email", soloUsuario, async (req, res) => {
  try {
    const email = req.emailUsuario;
    const historial = await Solicitud.find({ email }).sort({ fecha: -1 }).limit(20);
    res.json(historial);
  } catch (err) {
    res.json([]);
  }
});

/* ================= RUTAS ADMIN ================= */

app.get("/api/solicitudes", soloAdmin, async (req, res) => {
  const sol = await Solicitud.find({ estado: "pendiente" });
  res.json(sol);
});

app.get("/api/usuarios", soloAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.json([]);
  }
});

app.post("/api/aprobar", soloAdmin, async (req, res) => {
  try {
    const s = await Solicitud.findById(req.body.id);
    if (!s) return res.json({ ok: false, msg: "Solicitud no encontrada" });

    const u = await User.findOne({ email: s.email });
    if (!u) return res.json({ ok: false, msg: "Usuario no encontrado" });

    if (s.tipo === "inversion") {
      let ganancia = s.monto;
      if (s.monto == 10) ganancia = 16;
      else if (s.monto == 20) ganancia = 26;
      else if (s.monto == 30) ganancia = 40;
      else if (s.monto > 30) ganancia = s.monto * 1.5;

      u.saldo += ganancia;
      u.dias = 0;
      u.ultimaActualizacion = new Date();
      u.cicloActivo = true;
      await u.save();

      // Comisión al referido
      if (u.referidoPor) {
        const patrocinador = await User.findOne({ email: u.referidoPor });
        if (patrocinador) {
          patrocinador.saldo += 1;
          await patrocinador.save();
        }
      }
    }

    // En retiro: el saldo ya fue descontado al crear la solicitud
    s.estado = "aprobado";
    await s.save();

    const mensaje = s.tipo === "inversion"
      ? "Inversión aprobada y generando ganancias."
      : "Retiro aprobado y enviado.";

    res.json({ ok: true, msg: mensaje });
  } catch (err) {
    res.json({ ok: false, msg: "Error aprobando" });
  }
});

app.post("/api/rechazar", soloAdmin, async (req, res) => {
  try {
    const s = await Solicitud.findById(req.body.id);
    if (!s) return res.json({ ok: false, msg: "Solicitud no encontrada" });

    // Si era retiro, devolver el saldo al usuario
    if (s.tipo === "retiro") {
      const u = await User.findOne({ email: s.email });
      if (u) {
        u.saldo = Math.round((u.saldo + s.monto) * 100) / 100;
        await u.save();
      }
    }

    s.estado = "rechazado";
    await s.save();
    res.json({ ok: true, msg: "Solicitud rechazada" });
  } catch (err) {
    res.json({ ok: false, msg: "Error rechazando" });
  }
});

app.post("/api/modificar-saldo", soloAdmin, async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const monto = Number(req.body.monto);
    const u = await User.findOne({ email });
    if (!u) return res.json({ ok: false, msg: "Usuario no encontrado" });

    u.saldo = monto;
    u.dias = 0;
    u.ultimaActualizacion = new Date();
    await u.save();

    res.json({ ok: true, msg: "Saldo actualizado correctamente" });
  } catch (err) {
    res.json({ ok: false, msg: "Error modificando saldo" });
  }
});

app.post("/api/eliminar-usuario", soloAdmin, async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const u = await User.findOne({ email });
    if (!u) return res.json({ ok: false, msg: "Usuario no existe" });

    await User.deleteOne({ email: u.email });
    await Solicitud.deleteMany({ email: u.email });

    res.json({ ok: true, msg: "Usuario eliminado correctamente" });
  } catch (err) {
    res.json({ ok: false, msg: "Error eliminando usuario" });
  }
});

/* ================== SERVER ================== */

app.listen(PORT, () => {
  console.log("🚀 Servidor activo en puerto " + PORT);
});
