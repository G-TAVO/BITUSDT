const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let users = [];

// Archivos públicos
app.use(express.static("public"));

// Página principal
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public/index.html"));
});

// REGISTRO
app.post("/api/register", (req, res) => {

const { nombre, email, password } = req.body;

if(!nombre || !email || !password){
return res.json({
ok:false,
msg:"Todos los campos son obligatorios"
});
}

users.push({ nombre, email, password });

res.json({
ok:true,
msg:"Usuario registrado correctamente"
});
});

// LOGIN
app.post("/api/login", (req, res) => {

const { email, password } = req.body;

const user = users.find(u =>
u.email === email &&
u.password === password
);

if(!user){
return res.json({
ok:false,
msg:"Correo o contraseña incorrectos"
});
}

res.json({
ok:true,
msg:"Bienvenido " + user.nombre
});
});

// PUERTO
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("Servidor activo en puerto", PORT);
});


