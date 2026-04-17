// ===============================
// SERVER.JS NIVEL DIOS - PRESTAMOS TAVO
// ===============================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

console.log("🚀 Iniciando servidor...");

// ===============================
// CONEXIÓN MONGO
// ===============================
mongoose.connect(
"mongodb+srv://Tavo:Enrique1998@cluster0.vuc3y2t.mongodb.net/prestamos?retryWrites=true&w=majority"
)
.then(() => {

console.log("✅ MongoDB Conectado");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("🚀 Servidor activo puerto " + PORT);
});

})
.catch(err => {
console.log("❌ Error Mongo:", err);
});

// ===============================
// MODELOS
// ===============================
const User = mongoose.model("usuarios", new mongoose.Schema({

nombre:String,
cedula:String,
telefono:String,
whatsapp:String,
email:String,
password:String,

saldo:{ type:Number, default:0 },
dias:{ type:Number, default:0 },
nequi:{ type:String, default:"" },

cuotasTotal:{ type:Number, default:0 },
cuotasPagadas:{ type:Number, default:0 },

bloqueado:{ type:Boolean, default:false }

}));

const Solicitud = mongoose.model("solicitudes", new mongoose.Schema({

nombre:String,
email:String,
monto:Number,
cuotas:Number,
fecha:String

}));

const Historial = mongoose.model("historial", new mongoose.Schema({

email:String,
tipo:String,
monto:Number,
detalle:String,
fecha:String

}));

const Pago = mongoose.model("pagos", new mongoose.Schema({

nombre:String,
email:String,
valor:Number,
estado:{ type:String, default:"pendiente" },
fecha:String

}));

// ===============================
// FUNCIONES
// ===============================
function fecha(){
return new Date().toLocaleString();
}

// ===============================
// REGISTRO
// ===============================
app.post("/api/register", async(req,res)=>{

try{

const { nombre, cedula, telefono, whatsapp, email, password } = req.body;

if(!nombre || !cedula || !telefono || !whatsapp || !email || !password){
return res.json({ ok:false, msg:"Faltan datos" });
}

const existe = await User.findOne({ email });

if(existe){
return res.json({ ok:false, msg:"Usuario ya existe" });
}

const hash = await bcrypt.hash(password,10);

await User.create({
nombre,
cedula,
telefono,
whatsapp,
email,
password:hash
});

res.json({ ok:true, msg:"Registro exitoso" });

}catch(err){
console.log(err);
res.json({ ok:false, msg:"Error registro" });
}

});

// ===============================
// LOGIN
// ===============================
app.post("/api/login", async(req,res)=>{

try{

const { email, password } = req.body;

// ADMIN
if(email === "admin@tavo.com" && password === "1234"){
return res.json({
ok:true,
usuario:{
nombre:"Administrador",
rol:"admin"
}
});
}

const user = await User.findOne({ email });

if(!user){
return res.json({ ok:false, msg:"Usuario no encontrado" });
}

if(user.bloqueado){
return res.json({ ok:false, msg:"Usuario bloqueado" });
}

const ok = await bcrypt.compare(password, user.password);

if(!ok){
return res.json({ ok:false, msg:"Contraseña incorrecta" });
}

res.json({
ok:true,
usuario:{
nombre:user.nombre,
email:user.email,
saldo:user.saldo,
dias:user.dias,
nequi:user.nequi,
cuotasTotal:user.cuotasTotal,
cuotasPagadas:user.cuotasPagadas,
rol:"user"
}
});

}catch(err){
res.json({ ok:false, msg:"Error login" });
}

});

// ===============================
// GUARDAR NEQUI
// ===============================
app.post("/api/nequi", async(req,res)=>{

try{

const { email, nequi } = req.body;

await User.updateOne({ email }, { nequi });

res.json({ ok:true });

}catch{
res.json({ ok:false });
}

});

// ===============================
// SOLICITAR PRESTAMO
// ===============================
app.post("/api/solicitar-prestamo", async(req,res)=>{

try{

const { email, monto, cuotas } = req.body;

const user = await User.findOne({ email });

if(!user){
return res.json({ ok:false, msg:"No existe usuario" });
}

if(user.saldo > 0){
return res.json({ ok:false, msg:"Ya tienes préstamo activo" });
}

await Solicitud.create({
nombre:user.nombre,
email,
monto:Number(monto),
cuotas:Number(cuotas || 4),
fecha:fecha()
});

res.json({ ok:true, msg:"Solicitud enviada" });

}catch(err){
res.json({ ok:false, msg:"Error solicitud" });
}

});

// ===============================
// VER SOLICITUDES
// ===============================
app.get("/api/solicitudes", async(req,res)=>{

const data = await Solicitud.find().sort({ _id:-1 });

res.json(data);

});

// ===============================
// APROBAR PRESTAMO
// ===============================
app.post("/api/aprobar", async(req,res)=>{

try{

const { id } = req.body;

const s = await Solicitud.findById(id);

if(!s){
return res.json({ msg:"Solicitud no encontrada" });
}

await User.updateOne(
{ email:s.email },
{
saldo:s.monto,
dias:30,
cuotasTotal:s.cuotas,
cuotasPagadas:0
}
);

await Historial.create({
email:s.email,
tipo:"prestamo",
monto:s.monto,
detalle:"Préstamo aprobado",
fecha:fecha()
});

await Solicitud.findByIdAndDelete(id);

res.json({ msg:"Préstamo aprobado" });

}catch(err){
res.json({ msg:"Error al aprobar" });
}

});

// ===============================
// RECHAZAR PRESTAMO
// ===============================
app.post("/api/rechazar", async(req,res)=>{

try{

await Solicitud.findByIdAndDelete(req.body.id);

res.json({ msg:"Solicitud rechazada" });

}catch{
res.json({ msg:"Error" });
}

});

// ===============================
// REPORTAR PAGO CLIENTE
// ===============================
app.post("/api/reportar-pago", async(req,res)=>{

try{

const { email, valor } = req.body;

const user = await User.findOne({ email });

if(!user){
return res.json({ ok:false });
}

await Pago.create({
nombre:user.nombre,
email,
valor:Number(valor),
fecha:fecha()
});

res.json({
ok:true,
msg:"Pago enviado al administrador"
});

}catch{
res.json({ ok:false });
}

});

// ===============================
// VER PAGOS
// ===============================
app.get("/api/pagos", async(req,res)=>{

const data = await Pago.find({ estado:"pendiente" }).sort({ _id:-1 });

res.json(data);

});

// ===============================
// APROBAR PAGO (ARREGLADO)
// ===============================
app.post("/api/aprobar-pago", async(req,res)=>{

try{

const { id } = req.body;

const pago = await Pago.findById(id);

if(!pago){
return res.json({ msg:"Pago no encontrado" });
}

const user = await User.findOne({ email:pago.email });

if(!user){
return res.json({ msg:"Usuario no existe" });
}

let saldoActual = Number(user.saldo || 0);
let valorPago = Number(pago.valor || 0);
let nuevoSaldo = saldoActual - valorPago;

if(nuevoSaldo < 0){
nuevoSaldo = 0;
}

let cuotasTotal = Number(user.cuotasTotal || 4);
let cuotasPagadas = Number(user.cuotasPagadas || 0);

let valorCuota = Math.round((saldoActual * 1.10) / cuotasTotal);

if(valorPago >= valorCuota && cuotasPagadas < cuotasTotal){
cuotasPagadas++;
}

if(nuevoSaldo === 0){
cuotasPagadas = cuotasTotal;
}

await User.updateOne(
{ email:pago.email },
{
saldo:nuevoSaldo,
cuotasPagadas:cuotasPagadas,
dias:30
}
);

await Historial.create({
email:pago.email,
tipo:"pago",
monto:valorPago,
detalle:"Pago aprobado por admin",
fecha:fecha()
});

await Pago.findByIdAndDelete(id);

res.json({ msg:"Pago aprobado correctamente" });

}catch(err){
console.log(err);
res.json({ msg:"Error aprobando pago" });
}

});

// ===============================
// RECHAZAR PAGO
// ===============================
app.post("/api/rechazar-pago", async(req,res)=>{

try{

await Pago.findByIdAndDelete(req.body.id);

res.json({ msg:"Pago rechazado" });

}catch{
res.json({ msg:"Error" });
}

});

// ===============================
// BLOQUEAR
// ===============================
app.post("/api/bloquear", async(req,res)=>{

await User.updateOne(
{ email:req.body.email },
{ bloqueado:true }
);

res.json({ msg:"Usuario bloqueado" });

});

// ===============================
// DESBLOQUEAR
// ===============================
app.post("/api/desbloquear", async(req,res)=>{

await User.updateOne(
{ email:req.body.email },
{ bloqueado:false }
);

res.json({ msg:"Usuario desbloqueado" });

});

// ===============================
// VER USUARIOS
// ===============================
app.get("/api/usuarios", async(req,res)=>{

const data = await User.find({},{
password:0
}).sort({ _id:-1 });

res.json(data);

});

// ===============================
// HISTORIAL
// ===============================
app.get("/api/historial-prestamos/:email", async(req,res)=>{

try{

const data = await Historial.find({
email:req.params.email
}).sort({ _id:-1 });

res.json(data);

}catch{
res.json([]);
}

});

// ===============================
// INICIO
// ===============================
app.get("/", (req,res)=>{
res.send("Servidor funcionando 🚀");
});
