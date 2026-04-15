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
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Conectado"))
.catch(err => console.log("Error DB:", err));


// ========================= MODELOS =========================
const User = mongoose.model("usuarios", new mongoose.Schema({
  nombre: String,
  cedula: String,
  telefono: String,
  whatsapp: String,
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

// 🔥 NUEVO MODELO (SOLICITUDES)
const Solicitud = mongoose.model("solicitudes", new mongoose.Schema({
  nombre: String,
  email: String,
  monto: Number,
  estado: { type:String, default:"pendiente" }
}));


// ========================= REGISTRO =========================
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, cedula, telefono, whatsapp, email, password } = req.body;

    if(!nombre || !cedula || !telefono || !whatsapp || !email || !password){
      return res.json({ ok:false, msg:"Faltan datos" });
    }

    const existe = await User.findOne({ email });
    if (existe) return res.json({ ok: false, msg: "El usuario ya existe" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      nombre,
      cedula,
      telefono,
      whatsapp,
      email,
      password: hashed
    });

    res.json({ ok: true, msg: "Registro exitoso" });

  } catch (err) {
    console.log(err);
    res.json({ ok: false, msg: "Error en registro" });
  }
});


// ========================= LOGIN =========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔥 ADMIN SIMPLE
    if(email === "admin@tavo.com" && password === "1234"){
      return res.json({
        ok:true,
        usuario:{ rol:"admin" }
      });
    }

    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: false, msg: "Usuario no encontrado" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ ok: false, msg: "Contraseña incorrecta" });

    res.json({
      ok: true,
      msg: "Bienvenido",
      usuario: {
        nombre: user.nombre,
        email: user.email,
        saldo: user.saldo,
        dias: user.dias,
        nequi: user.nequi
      }
    });

  } catch (err) {
    res.json({ ok: false, msg: "Error en login" });
  }
});


// ========================= GUARDAR NEQUI =========================
app.post("/api/nequi", async (req, res) => {
  try {
    const { email, nequi } = req.body;

    await User.updateOne({ email }, { nequi });

    res.json({ ok: true, msg: "Nequi guardado" });

  } catch (err) {
    res.json({ ok: false, msg: "Error guardando Nequi" });
  }
});


// ========================= SOLICITAR PRÉSTAMO (AHORA ES SOLICITUD) =========================
app.post("/api/solicitar-prestamo", async (req, res) => {
  try {
    const { email, monto } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.json({ ok: false, msg: "Usuario no existe" });

    if (user.saldo > 0) {
      return res.json({ ok: false, msg: "Ya tienes un préstamo activo" });
    }

    // 🔥 GUARDAR COMO SOLICITUD
    await Solicitud.create({
      nombre: user.nombre,
      email,
      monto: Number(monto)
    });

    res.json({ ok: true, msg: "Solicitud enviada, espera aprobación" });

  } catch (err) {
    res.json({ ok: false, msg: "Error en solicitud" });
  }
});


// ========================= VER SOLICITUDES (ADMIN) =========================
app.get("/api/solicitudes", async (req, res) => {
  const data = await Solicitud.find({ estado:"pendiente" });
  res.json(data);
});


// ========================= APROBAR =========================
app.post("/api/aprobar", async (req, res) => {
  try {
    const { id } = req.body;

    const s = await Solicitud.findById(id);
    if(!s) return res.json({ msg:"Solicitud no encontrada" });

    // Dar préstamo
    await User.updateOne(
      { email: s.email },
      { saldo: s.monto, dias: 30 }
    );

    // Guardar historial
    await Historial.create({
      email: s.email,
      monto: s.monto,
      fecha: new Date().toLocaleString()
    });

    await Solicitud.findByIdAndDelete(id);

    res.json({ msg: "Préstamo aprobado" });

  } catch (err) {
    res.json({ msg: "Error al aprobar" });
  }
});


// ========================= RECHAZAR =========================
app.post("/api/rechazar", async (req, res) => {
  try {
    const { id } = req.body;

    await Solicitud.findByIdAndDelete(id);

    res.json({ msg: "Solicitud rechazada" });

  } catch (err) {
    res.json({ msg: "Error al rechazar" });
  }
});


// ========================= HISTORIAL =========================
app.get("/api/historial-prestamos/:email", async (req, res) => {
  try {
    const data = await Historial.find({ email: req.params.email }).sort({ _id: -1 });
    res.json(data);
  } catch (err) {
    res.json([]);
  }
});


// ========================= SERVER =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor activo en puerto", PORT));
