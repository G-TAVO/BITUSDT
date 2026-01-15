const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// ADMIN
const ADMIN = {
email:"admin@bitusdt.com",
password:"$2b$10$8h8Yq0REEMPLAZAESTOPORHASHREAL"
};

// Crear archivo usuarios
if(!fs.existsSync("users.json")){
fs.writeFileSync("users.json","[]");
}

// REGISTRO
app.post("/api/register",async(req,res)=>{
let users = JSON.parse(fs.readFileSync("users.json"));

let exist = users.find(u=>u.email==req.body.email);
if(exist) return res.json({msg:"Correo ya registrado"});

let hash = await bcrypt.hash(req.body.password,10);

users.push({
email:req.body.email,
password:hash,
saldo:0
});

fs.writeFileSync("users.json",JSON.stringify(users,null,2));
res.json({msg:"Registro exitoso",ok:true});
});

// LOGIN
app.post("/api/login",async(req,res)=>{

// ADMIN
if(req.body.email===ADMIN.email){
let ok = await bcrypt.compare(req.body.password,ADMIN.password);
if(!ok) return res.json({msg:"Clave admin incorrecta"});
return res.json({ok:true,rol:"admin"});
}

// USERS
let users = JSON.parse(fs.readFileSync("users.json"));
let user = users.find(u=>u.email===req.body.email);
if(!user) return res.json({msg:"No existe"});

let ok = await bcrypt.compare(req.body.password,user.password);
if(!ok) return res.json({msg:"Clave incorrecta"});

res.json({ok:true,rol:"user"});
});

// LISTAR USUARIOS (ADMIN)
app.get("/api/users",(req,res)=>{
let users = JSON.parse(fs.readFileSync("users.json"));
res.json(users);
});

app.listen(PORT,()=>console.log("Servidor activo"));

