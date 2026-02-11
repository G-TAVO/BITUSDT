const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URL);

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

app.listen(process.env.PORT||3000);
