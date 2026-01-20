const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// ================== CONEXION MONGODB ==================
mongoose.connect(
"mongodb+srv://Tavo:Enrique1998@cluster0.vuc3y2t.mongodb.net/bitusdt"
)
.then(()=>console.log("MongoDB conectado"))
.catch(err=>console.log(err));

// ================== MODELOS ==================
const UserSchema = new mongoose.Schema({
email:String,
password:String,
saldo:Number,
dias:Number,
wallet:String
});

const SolicitudSchema = new mongoose.Schema({
email:String,
monto:Number,
estado:String,
tipo:String,
wallet:String,
fecha:{type:Date,default:Date.now}
});

const User = mongoose.model("User",UserSchema);
const Solicitud = mongoose.model("Solicitud",SolicitudSchema);

// ================= ADMIN =================
const ADMIN = {
email:"Binancecoin958@gmail.com",
password:"Enriique1998"
};

// ================= REGISTRO =================
app.post("/api/register",async(req,res)=>{

let existe = await User.findOne({email:req.body.email});
if(existe) return res.json({ok:false,msg:"Correo ya registrado"});

let hash = await bcrypt.hash(req.body.password,10);

await User.create({
email:req.body.email,
password:hash,
saldo:0,
dias:0,
wallet:""
});

res.json({ok:true,msg:"Registro exitoso"});
});

// ================= LOGIN =================
app.post("/api/login",async(req,res)=>{

// ADMIN
if(req.body.email==ADMIN.email){
if(req.body.password!=ADMIN.password){
return res.json({ok:false,msg:"Clave admin incorrecta"});
}
return res.json({ok:true,rol:"admin"});
}

// USUARIO
let user = await User.findOne({email:req.body.email});
if(!user) return res.json({ok:false,msg:"Usuario no existe"});

let ok = await bcrypt.compare(req.body.password,user.password);
if(!ok) return res.json({ok:false,msg:"Clave incorrecta"});

res.json({ok:true,rol:"user",user});
});

// ================= INVERTIR =================
app.post("/api/invertir",async(req,res)=>{

await Solicitud.create({
email:req.body.email,
monto:req.body.monto,
estado:"pendiente",
tipo:"inversion"
});

res.json({ok:true,msg:"Solicitud enviada al admin"});
});

// ================= LISTAR ADMIN =================
app.get("/api/solicitudes",async(req,res)=>{
let sol = await Solicitud.find({estado:"pendiente"});
res.json(sol);
});

// ================= APROBAR =================
app.post("/api/aprobar",async(req,res)=>{

let s = await Solicitud.findById(req.body.id);
if(!s) return res.json({ok:false,msg:"No existe"});

let u = await User.findOne({email:s.email});

if(s.tipo=="inversion"){
u.saldo += Number(s.monto);
u.dias = 0;
await u.save();
}

s.estado="aprobado";
await s.save();

res.json({ok:true,msg:"Aprobado"});
});

// ================= RECHAZAR =================
app.post("/api/rechazar",async(req,res)=>{

let s = await Solicitud.findById(req.body.id);
if(!s) return res.json({ok:false,msg:"No existe"});

s.estado="rechazado";
await s.save();

res.json({ok:true,msg:"Rechazado"});
});

// ================= RETIRAR =================
app.post("/api/retirar",async(req,res)=>{

let u = await User.findOne({email:req.body.email});

if(u.saldo<20){
return res.json({ok:false,msg:"Mínimo 20 USDT"});
}

await Solicitud.create({
email:u.email,
monto:u.saldo,
estado:"pendiente",
tipo:"retiro",
wallet:u.wallet
});

u.saldo=0;
u.dias=0;
await u.save();

res.json({ok:true,msg:"Solicitud de retiro enviada"});
});

// ================= WALLET =================
app.post("/api/wallet",async(req,res)=>{

let u = await User.findOne({email:req.body.email});
if(!u) return res.json({ok:false,msg:"Usuario no existe"});

u.wallet=req.body.wallet;
await u.save();

res.json({ok:true,msg:"Billetera guardada"});
});

// ================= SERVER =================
app.listen(PORT,()=>console.log("Servidor activo en puerto "+PORT));
