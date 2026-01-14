const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
 secret:"bitusdt_secret",
 resave:false,
 saveUninitialized:true
}));

// Usuarios demo
let users=[
 {email:"admin@bitusdt.com",pass:"amAdmin1998",rol:"admin",wallet:""},
];

let solicitudes=[];

// LOGIN
app.post("/api/login",(req,res)=>{
 let u = users.find(x=>x.email==req.body.email && x.pass==req.body.password);
 if(!u) return res.json({ok:false,msg:"Credenciales incorrectas"});

 req.session.user=u;
 res.json({ok:true,rol:u.rol});
});

// GUARDAR WALLET
app.post("/api/wallet",(req,res)=>{
 req.session.user.wallet=req.body.wallet;
 res.json({ok:true});
});

// SOLICITAR INVERSIÓN
app.post("/api/solicitar",(req,res)=>{
 solicitudes.push({
  id:Date.now(),
  email:req.session.user.email,
  monto:req.body.monto,
  wallet:req.session.user.wallet
 });
 res.json({ok:true});
});

// VER SOLICITUDES (ADMIN)
function isAdmin(req,res,next){
 if(!req.session.user || req.session.user.rol!="admin"){
  return res.redirect("/login.html");
 }
 next();
}

app.get("/api/solicitudes",isAdmin,(req,res)=>{
 res.json(solicitudes);
});

// APROBAR
app.post("/api/aprobar",isAdmin,(req,res)=>{
 solicitudes=solicitudes.filter(s=>s.id!=req.body.id);
 res.json({ok:true});
});

app.get("/admin",isAdmin,(req,res)=>{
 res.sendFile(path.join(__dirname,"public/admin.html"));
});

app.listen(3000,()=>console.log("Servidor activo"));

