// ========================= CONFIGURACIÓN =========================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // carpeta frontend

// ========================= CONEXIÓN MONGO =========================
mongoose.connect(process.env.MONGO_URL || "mongodb+srv://GustavoDB:tavo123@cluster0.mongodb.net/prestamos")
.then(()=>console.log("MongoDB Conectado"))
.catch(err=>console.log("Error DB:",err));


// ========================= MODELO USUARIO =========================
const User = mongoose.model("usuarios", new mongoose.Schema({
  email: String,
  password: String,
  saldo: { type:Number, default:0 },
  dias: { type:Number, default:0 },
  nequi: { type:String, default:"" },
}));


// ========================= MODELO HISTORIAL =========================
const Historial = mongoose.model("historial", new mongoose.Schema({
  email:String,
  monto:Number,
  fecha:String
}));


// ========================= REGISTRO =========================
app.post("/api/register", async(req,res)=>{
  const {email, password} = req.body;

  const existe = await User.findOne({email});
  if(existe) return res.json({ok:false, msg:"El usuario ya existe"});

  const hashed = await bcrypt.hash(password,10);

  await User.create({email,password:hashed});

  res.json({ok:true, msg:"Registro exitoso"});
});


// ========================= LOGIN =========================
app.post("/api/login", async(req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({email});
  if(!user) return res.json({ok:false, msg:"Usuario no encontrado"});

  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.json({ok:false, msg:"Contraseña incorrecta"});

  res.json({
    ok:true,
    msg:"Bienvenido",
    user:{
      email:user.email,
      saldo:user.saldo,
      dias:user.dias,
      nequi:user.nequi
    }
  });
});


// ========================= REGISTRAR NEQUI =========================
app.post("/api/nequi", async(req,res)=>{
  const {email,nequi} = req.body;

  await User.updateOne({email},{nequi});
  res.json({ok:true, msg:"Nequi actualizado"});
});


// ========================= SOLICITAR PRÉSTAMO =========================
app.post("/api/solicitar-prestamo", async(req,res)=>{
  const {email, monto} = req.body;

  const user = await User.findOne({email});

  if(user.saldo > 0){
    return res.json({ok:false, msg:"Ya tienes un préstamo activo"});
  }

  let dias = 30; // puedes cambiarlo

  await User.updateOne({email},{saldo:monto, dias});

  // Registrar historial
  await Historial.create({
    email,
    monto,
    fecha:new Date().toLocaleString()
  });

  res.json({ok:true, msg:"Préstamo aprobado"});
});


// ========================= HISTORIAL =========================
app.get("/api/historial-prestamos/:email", async(req,res)=>{
  const data = await Historial.find({email:req.params.email}).sort({_id:-1});
  res.json(data);
});


// ========================= PUERTO =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Servidor activo en puerto", PORT));
