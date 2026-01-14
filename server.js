const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Usuarios demo (luego puedes usar BD)
const users = [
 {email:"admin@bitusdt.com", password:"amAdmin1998", rol:"admin"},
 {email:"cliente@test.com", password:"1234", rol:"user"}
];

app.use(bodyParser.json());
app.use(express.static("public"));

app.use(session({
 secret:"bitusdt_secret",
 resave:false,
 saveUninitialized:true
}));

// LOGIN
app.post("/api/login",(req,res)=>{
 const {email,password} = req.body;

 const user = users.find(u=>u.email==email && u.password==password);

 if(!user){
   return res.json({ok:false,msg:"Credenciales incorrectas"});
 }

 req.session.user={
   email:user.email,
   rol:user.rol
 };

 res.json({ok:true,msg:"Bienvenido",rol:user.rol});
});

// CERRAR SESIÓN
app.get("/api/logout",(req,res)=>{
 req.session.destroy();
 res.json({ok:true});
});

// PROTEGER ADMIN
function isAdmin(req,res,next){
 if(!req.session.user || req.session.user.rol!=="admin"){
   return res.redirect("/login.html");
 }
 next();
}

// RUTA ADMIN SEGURA
app.get("/admin",isAdmin,(req,res)=>{
 res.sendFile(path.join(__dirname,"public/admin.html"));
});

app.listen(3000,()=>{
 console.log("Servidor activo puerto 3000");
});
