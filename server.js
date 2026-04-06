const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// ----------------------
//  CONEXIÓN MONGODB
// ----------------------
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB conectado"))
.catch(err => console.log("Error Mongo:", err));

// ----------------------
//  MODELO USUARIO
// ----------------------
const usuarioSchema = new mongoose.Schema({
  nombre: String,
  email: { type: String, unique: true },
  telefono: String,
  password: String,
  rol: { type: String, default: "usuario" },

  // PRÉSTAMOS:
  montoPrestamo: { type: Number, default: 0 },
  saldoPendiente: { type: Number, default: 0 },
  diasPrestamo: { type: Number, default: 0 },

  // Estados:
  solicitudPrestamo: { type: Boolean, default: false },
  solicitudAbono: { type: Number, default: 0 } // monto solicitado para abonar
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

// ----------------------
//   REGISTRO
// ----------------------
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, email, telefono, password } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) return res.json({ ok: false, msg: "Este correo ya está registrado" });

    const hash = await bcrypt.hash(password, 10);

    const nuevo = new Usuario({
      nombre,
      email,
      telefono,
      password: hash
    });

    await nuevo.save();

    res.json({ ok: true, msg: "Registro exitoso" });

  } catch (error) {
    res.json({ ok: false, msg: "Error registrando usuario" });
  }
});

// ----------------------
//   LOGIN
// ----------------------
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Usuario.findOne({ email });
  if (!user) return res.json({ ok: false, msg: "Correo no encontrado" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ ok: false, msg: "Contraseña incorrecta" });

  res.json({ ok: true, user, rol: user.rol });
});

// ----------------------
//   USUARIO SOLICITA PRÉSTAMO
// ----------------------
app.post("/api/solicitar-prestamo", async (req, res) => {
  const { email, monto } = req.body;

  const user = await Usuario.findOne({ email });

  if (user.saldoPendiente > 0)
    return res.json({ ok: false, msg: "Debes pagar tu préstamo actual antes de pedir otro" });

  user.solicitudPrestamo = true;
  user.montoPrestamo = monto;

  await user.save();

  res.json({ ok: true, msg: "Solicitud enviada. El administrador debe aprobarlo." });
});

// ----------------------
//   USUARIO SOLICITA ABONO
// ----------------------
app.post("/api/solicitar-abono", async (req, res) => {
  const { email, monto } = req.body;

  const user = await Usuario.findOne({ email });

  if (user.saldoPendiente <= 0)
    return res.json({ ok: false, msg: "No tienes préstamo activo" });

  user.solicitudAbono = monto;
  await user.save();

  res.json({ ok: true, msg: "Solicitud enviada. El administrador verificará el abono." });
});

// ----------------------
//   ADMIN: APROBAR PRÉSTAMO
// ----------------------
app.post("/api/admin/aprobar-prestamo", async (req, res) => {
  const { email, dias } = req.body;

  const user = await Usuario.findOne({ email });

  if (!user.solicitudPrestamo)
    return res.json({ ok: false, msg: "No hay solicitud pendiente" });

  user.solicitudPrestamo = false;
  user.saldoPendiente = user.montoPrestamo;
  user.diasPrestamo = dias;

  await user.save();

  res.json({ ok: true, msg: "Préstamo aprobado" });
});

// ----------------------
//   ADMIN: REGISTRAR ABONO
// ----------------------
app.post("/api/admin/abono", async (req, res) => {
  const { email } = req.body;

  const user = await Usuario.findOne({ email });

  if (!user.solicitudAbono)
    return res.json({ ok: false, msg: "No hay solicitud de abono" });

  user.saldoPendiente -= user.solicitudAbono;
  if (user.saldoPendiente < 0) user.saldoPendiente = 0;

  user.solicitudAbono = 0;

  await user.save();

  res.json({ ok: true, msg: "Abono registrado correctamente" });
});

// ----------------------
//   ADMIN: LISTAR USUARIOS
// ----------------------
app.get("/api/admin/usuarios", async (req, res) => {
  const lista = await Usuario.find();
  res.json(lista);
});

// ----------------------
//  PUERTO SERVIDOR
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor en puerto", PORT));
