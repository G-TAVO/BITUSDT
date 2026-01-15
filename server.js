const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

/* ================= ADMIN ================= */

const ADMIN = {
 email: "admin@bitusdt.com",
 password: "$2b$10$7M3d6AqfB6mN0u0c5Z0M0u6vW5vM5pJZ3RrH3h1m3b1wE4q"
};
// contraseña real: amAdmin1998

/* ================= BD ================= */

if (!fs.existsSync("users.json")) {
 fs.writeFileSync("users.json", "[]");
}

/* ================= EMAIL ================= */

const transporter = nodemailer.createTransport({
 service: "gmail",
 auth: {
   user: "TU_CORREO@gmail.com",
   pass: "CLAVE_APP_GMAIL"
 }
});

/* ================= REGISTRO ================= */

app.post("/api/register", async (req, res) => {
 try{

 let users = JSON.parse(fs.readFileSync("users.json"));

 let exist = users.find(u => u.email == req.body.email);
 if (exist) return res.json({ msg: "Correo ya registrado" });

 let hash = await bcrypt.hash(req.body.password, 10);

 users.push({
   email: req.body.email,
   password: hash,
   saldo: 0,
   rol: "cliente"
 });

 fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
 res.json({ msg: "Registro exitoso", ok: true });

 }catch(e){
  res.json({msg:"Error servidor"});
 }
});

/* ================= LOGIN ================= */

app.post("/api/login", async (req, res) => {
 try{

 if (req.body.email == ADMIN.email) {
   let ok = await bcrypt.compare(req.body.password, ADMIN.password);
   if (!ok) return res.json({ msg: "Clave admin incorrecta" });
   return res.json({ ok: true, rol: "admin" });
 }

 let users = JSON.parse(fs.readFileSync("users.json"));
 let user = users.find(u => u.email == req.body.email);
 if (!user) return res.json({ msg: "No existe" });

 let ok = await bcrypt.compare(req.body.password, user.password);
 if (!ok) return res.json({ msg: "Clave incorrecta" });

 res.json({ ok: true, rol: "cliente" });

 }catch(e){
  res.json({msg:"Error servidor"});
 }
});

/* ================= RECUPERAR ================= */

app.post("/api/forgot", async (req, res) => {
 try{

 let users = JSON.parse(fs.readFileSync("users.json"));
 let user = users.find(u => u.email == req.body.email);
 if (!user) return res.json({ msg: "Correo no registrado" });

 let nueva = Math.random().toString(36).slice(2,8);

 user.password = await bcrypt.hash(nueva,10);
 fs.writeFileSync("users.json", JSON.stringify(users,null,2));

 await transporter.sendMail({
   from:"BITUSDT",
   to:req.body.email,
   subject:"Recuperar contraseña",
   html:`Tu nueva contraseña es: <b>${nueva}</b>`
 });

 res.json({ok:true,msg:"Revisa tu correo"});

 }catch(e){
  res.json({msg:"Error enviando correo"});
 }
});

/* ================= ADMIN ================= */

app.get("/api/users", (req, res) => {
 let users = JSON.parse(fs.readFileSync("users.json"));
 res.json(users);
});

app.listen(PORT, () => console.log("Servidor activo"));
