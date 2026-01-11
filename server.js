const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

let users = [];

// REGISTRO
app.post("/api/register",(req,res)=>{
const {nombre,email,password,ref} = req.body;

const existe = users.find(u=>u.email===email);
if(existe) return res.json({ok:false,msg:"Correo ya registrado"});

const user={
nombre,
email,
password,
balance:0,
ganado:0,
referidoPor: ref || null,
equipo:[]
};

users.push(user);

// guardar equipo
if(ref){
const padre = users.find(u=>u.email===ref);
if(padre) padre.equipo.push(email);
}

res.json({ok:true,msg:"Registro exitoso"});
});

// LOGIN
app.post("/api/login",(req,res)=>{
const {email,password}=req.body;
const user = users.find(u=>u.email===email && u.password===password);

if(!user) return res.json({ok:false,msg:"Datos incorrectos"});

res.json({
ok:true,
msg:"Bienvenido "+user.nombre,
user
});
});

// VER PERFIL
app.post("/api/profile",(req,res)=>{
const {email}=req.body;
const user = users.find(u=>u.email===email);
res.json(user);
});

// ADMIN
app.get("/api/admin",(req,res)=>{
res.json(users);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log("Servidor activo"));


