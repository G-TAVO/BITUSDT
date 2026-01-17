
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
  email: "Binancecoin958@gmail.com",
  password: "Enriique1998",
  rol: "admin"
};

// ARCHIVOS
if(!fs.existsSync("users.json")) fs.writeFileSync("users.json","[]");
if(!fs.existsSync("solicitudes.json")) fs.writeFileSync("solicitudes.json","[]");

// AUX
const leerUsuarios = ()=>JSON.parse(fs.readFileSync("users.json","utf8"));
const guardarUsuarios = (data)=>fs.writeFileSync("users.json",JSON.stringify(data,null,2));
const leerSolicitudes = ()=>JSON.parse(fs.readFileSync("solicitudes.json","utf8"));
const guardarSolicitudes = (data)=>fs.writeFileSync("solicitudes.json",JSON.stringify(data,null,2));

// ===== REGISTRO =====
app.post("/api/register", async(req,res)=>{
  let users = leerUsuarios();
  if(users.find(u=>u.email===req.body.email)) return res.json({ok:false,msg:"Correo ya registrado"});

  const hash = await bcrypt.hash(req.body.password,10);
  users.push({
    email: req.body.email,
    password: hash,
    saldo: 0,
    dias: 0,
    wallet: "",
    solicitudes: []
  });
  guardarUsuarios(users);
  res.json({ok:true,msg:"Registro exitoso"});
});

// ===== LOGIN =====
app.post("/api/login", async(req,res)=>{
  // Login admin
  if(req.body.email===ADMIN.email){
    if(req.body.password!==ADMIN.password) return res.json({ok:false,msg:"Clave admin incorrecta"});
    return res.json({ok:true,rol:"admin",user:{email:ADMIN.email}});
  }

  let users = leerUsuarios();
  let user = users.find(u=>u.email===req.body.email);
  if(!user) return res.json({ok:false,msg:"Usuario no existe"});

  const match = await bcrypt.compare(req.body.password,user.password);
  if(!match) return res.json({ok:false,msg:"Clave incorrecta"});

  res.json({ok:true,rol:"user",user});
});

// ===== CREAR SOLICITUD =====
app.post("/api/invertir",(req,res)=>{
  let solicitudes = leerSolicitudes();

  solicitudes.push({
    id: Date.now(),
    email: req.body.email,
    monto: parseFloat(req.body.monto),
    estado: "pendiente"
  });

  guardarSolicitudes(solicitudes);
  res.json({ok:true,msg:"Solicitud enviada al admin"});
});

// ===== LISTAR SOLICITUDES (ADMIN) =====
app.get("/api/solicitudes",(req,res)=>{
  let solicitudes = leerSolicitudes();
  res.json(solicitudes.filter(s=>s.estado==="pendiente"));
});

// ===== APROBAR =====
app.post("/api/aprobar",(req,res)=>{
  let solicitudes = leerSolicitudes();
  let users = leerUsuarios();

  let s = solicitudes.find(x=>x.id===parseInt(req.body.id));
  if(!s) return res.json({ok:false,msg:"Solicitud no encontrada"});

  let u = users.find(x=>x.email===s.email);
  if(!u) return res.json({ok:false,msg:"Usuario no encontrado"});

  u.saldo += s.monto;
  u.dias = 0;
  s.estado = "aprobado";

  guardarSolicitudes(solicitudes);
  guardarUsuarios(users);

  res.json({ok:true,msg:"Aprobado"});
  // ===== RECHAZAR =====
app.post("/api/rechazar", (req,res)=>{
  let solicitudes = leerSolicitudes();
  let s = solicitudes.find(x=>x.id===parseInt(req.body.id));
  if(!s) return res.json({ok:false,msg:"Solicitud no encontrada"});

  s.estado = "rechazada";

  guardarSolicitudes(solicitudes);
  res.json({ok:true,msg:"Solicitud rechazada"});
});



// ===== RETIRO =====
app.post("/api/retirar",(req,res)=>{
  let users = leerUsuarios();
  let u = users.find(x=>x.email===req.body.email);
  if(!u) return res.json({ok:false,msg:"Usuario no encontrado"});

  if(u.saldo<20) return res.json({ok:false,msg:"Mínimo 20 USDT"});

  u.saldo=0;
  u.dias=0;

  guardarUsuarios(users);
  res.json({ok:true,msg:"Retiro simulado exitoso"});
});

app.listen(PORT,()=>console.log("Servidor activo en puerto "+PORT));

