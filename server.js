const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let users = [];

// Archivos públicos
app.use(express.static("public"));

// Página principal
app.get("/", (req,res)=>{
res.sendFile(path.join(__dirname,"public/index.html"));
});

// REGISTRO
app.post("/api/register",(req,res)=>{
const { nombre,email,password,ref } = req.body;

if(!nombre || !email || !password){
return res.json({ok:false,msg:"Completa todos los campos"});
}

// código único
const code = "USR" + Math.floor(Math.random()*99999);

users.push({
nombre,
email,
password,
code,
ref
});

res.json({
ok:true,
msg:"Registro exitoso",
code
});
});

// LOGIN
app.post("/api/login",(req,res)=>{
const { email,password } = req.body;

const user = users.find(u =>
u.email===email &&
u.password===password
);

if(!user){
return res.json({ok:false,msg:"Datos incorrectos"});
}

res.json({
ok:true,
msg:"Bienvenido " + user.nombre,
code:user.code
});
});

// VER EQUIPO
app.post("/api/team",(req,res)=>{
const { code } = req.body;

const team = users.filter(u=>u.ref===code);

res.json({
ok:true,
team
});
});

// ADMIN (demo)
app.get("/api/admin",(req,res)=>{
res.json({
usuarios:users.length,
data:users
});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
console.log("Servidor activo",PORT);
});

