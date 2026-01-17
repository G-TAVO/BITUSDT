const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// ADMIN
const ADMIN = {
email:"Binancecoin958@gmail.com",
password:"Enriique1998"
};

// ARCHIVOS
if(!fs.existsSync("users.json")){
fs.writeFileSync("users.json","[]");
}

if(!fs.existsSync("solicitudes.json")){
fs.writeFileSync("solicitudes.json","[]");
}

// ===== REGISTRO =====
app.post("/api/register",async(req,res)=>{

try{

let users = JSON.parse(fs.readFileSync("users.json"));

let existe = users.find(u=>u.email==req.body.email);
if(existe) return res.json({msg:"Correo ya registrado"});

let hash = await bcrypt.hash(req.body.password,10);

users.push({
email:req.body.email,
password:hash,
saldo:0,
dias:0
});

fs.writeFileSync("users.json",JSON.stringify(users,null,2));
res.json({ok:true,msg:"Registro exitoso"});

}catch(e){
console.log(e);
res.status(500).json({msg:"Error servidor"});
}

});

// ===== LOGIN =====
app.post("/api/login",async(req,res)=>{

try{

// ADMIN
if(req.body.email==ADMIN.email){

if(req.body.password!=ADMIN.password){
return res.json({msg:"Clave admin incorrecta"});
}

return res.json({ok:true,rol:"admin"});
}

// USUARIOS
let users = JSON.parse(fs.readFileSync("users.json"));
let user = users.find(u=>u.email==req.body.email);
if(!user) return res.json({msg:"Usuario no existe"});

let ok = await bcrypt.compare(req.body.password,user.password);
if(!ok) return res.json({msg:"Clave incorrecta"});

res.json({ok:true,rol:"user",user});

}catch(e){
console.log(e);
res.status(500).json({msg:"Error servidor"});
}

});

// ===== CREAR SOLICITUD =====
app.post("/api/invertir",(req,res)=>{

try{

let sol = JSON.parse(fs.readFileSync("solicitudes.json"));

sol.push({
id:Date.now(),
email:req.body.email,
monto:req.body.monto,
estado:"pendiente"
});

fs.writeFileSync("solicitudes.json",JSON.stringify(sol,null,2));
res.json({msg:"Solicitud enviada al admin"});

}catch(e){
console.log(e);
res.status(500).json({msg:"Error servidor"});
}

});

// ===== LISTAR SOLICITUDES =====
app.get("/api/solicitudes",(req,res)=>{

try{
let sol = JSON.parse(fs.readFileSync("solicitudes.json"));
res.json(sol.filter(s=>s.estado=="pendiente"));
}catch(e){
console.log(e);
res.json([]);
}

});

// ===== APROBAR =====
app.post("/api/aprobar",(req,res)=>{

try{

let sol = JSON.parse(fs.readFileSync("solicitudes.json"));
let users = JSON.parse(fs.readFileSync("users.json"));

let s = sol.find(x=>x.id==req.body.id);
if(!s) return res.json({msg:"No existe"});

let u = users.find(x=>x.email==s.email);

u.saldo += parseInt(s.monto);
u.dias = 0;

s.estado="aprobado";

fs.writeFileSync("solicitudes.json",JSON.stringify(sol,null,2));
fs.writeFileSync("users.json",JSON.stringify(users,null,2));

res.json({msg:"Aprobado"});

}catch(e){
console.log(e);
res.status(500).json({msg:"Error servidor"});
}

});

// ===== RETIRO =====
app.post("/api/retirar",(req,res)=>{

try{

let users = JSON.parse(fs.readFileSync("users.json"));
let u = users.find(x=>x.email==req.body.email);

if(u.saldo<20){
return res.json({msg:"Mínimo 20 USDT"});
}

u.saldo=0;
u.dias=0;

fs.writeFileSync("users.json",JSON.stringify(users,null,2));
res.json({msg:"Retiro simulado exitoso"});

}catch(e){
console.log(e);
res.status(500).json({msg:"Error servidor"});
}

});

app.listen(PORT,()=>console.log("Servidor activo en puerto "+PORT));
