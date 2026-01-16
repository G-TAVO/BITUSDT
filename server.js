const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

/* ADMIN */
const ADMIN = {
 email:"Binancecoin958@gmail.com",
 pass:"Enriique1998"
};

/* BD */
if(!fs.existsSync("users.json")){
 fs.writeFileSync("users.json","[]");
}

/* EMAIL */
const transporter = nodemailer.createTransport({
 service:"gmail",
 auth:{
   user:"Binancecoin958@gmail.com",
   pass:"CLAVE_APP_GMAIL"
 }
});

/* REGISTRO */
app.post("/api/register",async(req,res)=>{
 let users = JSON.parse(fs.readFileSync("users.json"));

 let exist = users.find(u=>u.email==req.body.email);
 if(exist) return res.json({msg:"Correo ya registrado"});

 let hash = await bcrypt.hash(req.body.password,10);

 users.push({
  email:req.body.email,
  password:hash,
  wallet:req.body.wallet,
  saldo:0,
  hoy:0,
  total:0,
  invPend:0,
  retPend:0,
  ref:req.body.ref || ""
 });

 fs.writeFileSync("users.json",JSON.stringify(users,null,2));
 res.json({ok:true,msg:"Registro exitoso"});
});

/* LOGIN */
app.post("/api/login",async(req,res)=>{
 let {email,password}=req.body;

 if(email==ADMIN.email && password==ADMIN.pass){
  return res.json({ok:true,rol:"admin"});
 }

 let users = JSON.parse(fs.readFileSync("users.json"));
 let user = users.find(u=>u.email==email);
 if(!user) return res.json({msg:"Datos incorrectos"});

 let ok = await bcrypt.compare(password,user.password);
 if(!ok) return res.json({msg:"Datos incorrectos"});

 res.json({ok:true,rol:"user",email:user.email});
});

/* LISTAR */
app.get("/api/users",(req,res)=>{
 let users = JSON.parse(fs.readFileSync("users.json"));
 res.json(users);
});

/* SOLICITAR INVERSION */
app.post("/api/invert",(req,res)=>{
 let users = JSON.parse(fs.readFileSync("users.json"));
 let u = users.find(x=>x.email==req.body.email);
 u.invPend=req.body.amount;
 fs.writeFileSync("users.json",JSON.stringify(users,null,2));
 res.json({msg:"Solicitud enviada"});
});

/* SOLICITAR RETIRO */
app.post("/api/retirar",(req,res)=>{
 let users = JSON.parse(fs.readFileSync("users.json"));
 let u = users.find(x=>x.email==req.body.email);
 u.retPend=u.saldo;
 fs.writeFileSync("users.json",JSON.stringify(users,null,2));
 res.json({msg:"Solicitud enviada"});
});

/* APROBAR */
app.post("/api/aprobar",(req,res)=>{
 let users = JSON.parse(fs.readFileSync("users.json"));
 let u = users.find(x=>x.email==req.body.email);

 if(req.body.tipo=="inv"){
  u.saldo+=u.invPend;
  u.hoy+=u.invPend*0.05;
  u.total+=u.invPend*0.05;
  u.invPend=0;
 }

 if(req.body.tipo=="ret"){
  u.saldo=0;
  u.hoy=0;
  u.total=0;
  u.retPend=0;
 }

 fs.writeFileSync("users.json",JSON.stringify(users,null,2));
 res.json({msg:"Acción aplicada"});
});

/* RECUPERAR */
app.post("/api/forgot",(req,res)=>{
 let users = JSON.parse(fs.readFileSync("users.json"));
 let u = users.find(x=>x.email==req.body.email);
 if(!u) return res.json({msg:"Correo no existe"});

 transporter.sendMail({
  from:"BITUSDT",
  to:u.email,
  subject:"Recuperación contraseña",
  text:"Contacta al admin para restablecer tu acceso."
 });

 res.json({msg:"Correo enviado"});
});

app.listen(PORT,()=>console.log("Activo"));
