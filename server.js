const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB conectado"));

const UserSchema = new mongoose.Schema({
  email:String,
  password:String,
  nombre:{type:String,default:""},
  saldo:{type:Number,default:0},
  dias:{type:Number,default:0},
  wallet:{type:String,default:""},
  ultimaActualizacion:{type:Date,default:Date.now}
});

const SolicitudSchema = new mongoose.Schema({
  email:String,
  nombre:String,
  saldoActual:Number,
  monto:Number,
  tipo:String,
  estado:String,
  wallet:String
});

const User = mongoose.model("User",UserSchema);
const Solicitud = mongoose.model("Solicitud",SolicitudSchema);

const ADMIN = {
  email:"Binancecoin958@gmail.com",
  password:"Enriique1998"
};

app.post("/api/login", async(req,res)=>{
  if(req.body.email === ADMIN.email){
    if(req.body.password !== ADMIN.password){
      return res.json({ok:false,msg:"Clave admin incorrecta"});
    }
    return res.json({ok:true,rol:"admin"});
  }

  const user = await User.findOne({email:req.body.email});
  if(!user) return res.json({ok:false,msg:"Usuario no existe"});

  const ok = await bcrypt.compare(req.body.password,user.password);
  if(!ok) return res.json({ok:false,msg:"Clave incorrecta"});

  res.json({
    ok:true,
    rol:"user",
    user:{
      email:user.email,
      nombre:user.nombre,
      saldo:user.saldo,
      dias:user.dias
    }
  });
});

app.post("/api/register", async(req,res)=>{
  const existe = await User.findOne({email:req.body.email});
  if(existe) return res.json({ok:false,msg:"Correo ya registrado"});
  const hash = await bcrypt.hash(req.body.password,10);
  await User.create({email:req.body.email,password:hash});
  res.json({ok:true,msg:"Registro exitoso"});
});

app.post("/api/nombre", async(req,res)=>{
  const u = await User.findOne({email:req.body.email});
  u.nombre = req.body.nombre;
  await u.save();
  res.json({ok:true,msg:"Nombre guardado"});
});

app.post("/api/invertir", async(req,res)=>{
  const u = await User.findOne({email:req.body.email});
  await Solicitud.create({
    email:u.email,
    nombre:u.nombre,
    saldoActual:u.saldo,
    monto:req.body.monto,
    tipo:"inversion",
    estado:"pendiente",
    wallet:u.wallet
  });
  res.json({ok:true,msg:"Solicitud enviada"});
});

app.get("/api/solicitudes", async(req,res)=>{
  const s = await Solicitud.find({estado:"pendiente"});
  res.json(s);
});

app.post("/api/aprobar", async(req,res)=>{
  const s = await Solicitud.findById(req.body.id);
  s.estado="aprobado";
  await s.save();
  res.json({ok:true});
});

app.post("/api/rechazar", async(req,res)=>{
  const s = await Solicitud.findById(req.body.id);
  s.estado="rechazado";
  await s.save();
  res.json({ok:true});
});

app.listen(process.env.PORT||3000);
