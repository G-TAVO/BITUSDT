const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("TU_URL_MONGODB")
.then(()=>console.log("BD conectada"))
.catch(e=>console.log(e));

// ================= MODELOS =================

const User = mongoose.model("User",{
correo:String,
pass:String,
rol:{type:String,default:"cliente"},
saldo:{type:Number,default:0},
referido:String
});

const Inversion = mongoose.model("Inversion",{
correo:String,
monto:Number,
ganancia:Number,
estado:{type:String,default:"pendiente"}
});

const Retiro = mongoose.model("Retiro",{
correo:String,
monto:Number,
estado:{type:String,default:"pendiente"}
});

// ================= UTIL =================

function token(usuario){
return jwt.sign(usuario,"CLAVESECRETA");
}

function auth(req,res,next){
let t=req.headers.authorization;
if(!t) return res.json({msg:"No autorizado"});
jwt.verify(t,"CLAVESECRETA",(e,u)=>{
if(e) return res.json({msg:"Token inválido"});
req.user=u;
next();
});
}

// ================= REGISTRO =================

app.post("/register", async(req,res)=>{
let {correo,pass,ref}=req.body;

let existe=await User.findOne({correo});
if(existe) return res.json({msg:"Ya existe"});

let hash=await bcrypt.hash(pass,10);

await User.create({
correo,
pass:hash,
referido:ref
});

res.json({msg:"Registrado"});
});

// ================= LOGIN =================

app.post("/login", async(req,res)=>{

let {correo,pass}=req.body;
let u=await User.findOne({correo});
if(!u) return res.json({ok:false});

let ok=await bcrypt.compare(pass,u.pass);
if(!ok) return res.json({ok:false});

let t=token({correo:u.correo,rol:u.rol});

res.json({ok:true,rol:u.rol,token:t});
});

// ================= INVERTIR =================

app.post("/invertir",auth, async(req,res)=>{

let {monto}=req.body;

let map={
10:0.4,
20:0.5,
30:0.6,
40:0.7,
50:0.8
};

await Inversion.create({
correo:req.user.correo,
monto,
ganancia:map[monto]
});

res.json({msg:"Solicitud enviada"});
});

// ================= ADMIN VER =================

app.get("/admin/inversiones",auth, async(req,res)=>{
if(req.user.rol!="admin") return res.json({msg:"No autorizado"});
let inv=await Inversion.find({estado:"pendiente"});
res.json(inv);
});

// ================= ADMIN APROBAR =================

app.post("/admin/aprobar",auth, async(req,res)=>{
if(req.user.rol!="admin") return res.json({msg:"No autorizado"});

let {id}=req.body;

let inv=await Inversion.findById(id);
inv.estado="aprobado";
await inv.save();

let u=await User.findOne({correo:inv.correo});
u.saldo+=inv.ganancia;
await u.save();

res.json({msg:"Aprobado"});
});

// ================= RETIRO =================

app.post("/retirar",auth, async(req,res)=>{

let {monto}=req.body;

if(monto<20)
return res.json({msg:"Mínimo 20"});

await Retiro.create({
correo:req.user.correo,
monto
});

res.json({msg:"Solicitud enviada"});
});

// ================= HISTORIAL =================

app.get("/historial",auth, async(req,res)=>{

let inv=await Inversion.find({correo:req.user.correo});
let ret=await Retiro.find({correo:req.user.correo});

res.json({inv,ret});
});

// ================= SERVER =================

app.listen(3000,()=>console.log("Servidor activo"));

