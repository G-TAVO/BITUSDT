const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

/* ================== MONGODB ================== */

mongoose.connect(
  process.env.MONGO_URL ||
  "mongodb+srv://Tavo:Enrique1998@cluster0.vuc3y2t.mongodb.net/bitusdt"
)
.then(() => console.log("✅ MongoDB conectado"))
.catch(err => console.log("❌ Error Mongo:", err));

/* ================== MODELOS ================== */

const UserSchema = new mongoose.Schema({
  userId:String,
  email:{ type:String, unique:true },
  password:String,
  nombre:{ type:String, default:"" },
  telefono:{ type:String, default:"" },
  saldo:{ type:Number, default:0 },
  dias:{ type:Number, default:0 },

  nequi:{ type:String, default:"" },
  

  referidoPor:{ type:String, default:"" },
  ultimaActualizacion:{ type:Date, default:Date.now }
});
const SolicitudSchema = new mongoose.Schema({
  email:String,
  monto:Number,
  estado:String,
  tipo:String,
  nequi:String,
  fecha:{ type:Date, default:Date.now }
});

const User = mongoose.model("User", UserSchema);
const Solicitud = mongoose.model("Solicitud", SolicitudSchema);

/* ================= ADMIN ================= */

const ADMIN = {
  email:"Binancecoin958@gmail.com",
  password:"Enriique1998"
};

/* ================= GANANCIAS ================= */

async function actualizarGanancias(user){

  const hoy = new Date();
  const ultimo = new Date(user.ultimaActualizacion);

  const diasPasados = Math.floor((hoy-ultimo)/(1000*60*60*24));

  if(diasPasados>0){

    user.saldo += diasPasados*0.5;
    user.dias += diasPasados;
    user.ultimaActualizacion = hoy;

    await user.save();

  }

}

/* ================= REGISTRO ================= */

app.post("/api/register", async(req,res)=>{

  const email = req.body.email.toLowerCase();

  const existe = await User.findOne({email});
  if(existe) return res.json({ok:false,msg:"Correo ya registrado"});

  const hash = await bcrypt.hash(req.body.password,10);

  const totalUsuarios = await User.countDocuments();
  const nuevoId = "USR-"+(1001+totalUsuarios);

//  await User.create({//
 //   userId:nuevoId,//
  //  email,//
  //  password:hash,//
  //  n//
   // saldo:0,//
   // dias:0,//
    
  //  referidoPor:req.body.referidoPor||""//
//  });//
  await User.create({
userId:nuevoId,
email,
password:hash,
nombre:req.body.nombre || "Usuario",
telefono:req.body.telefono || "",
saldo:0,
dias:0,
referidoPor:req.body.referidoPor || ""
});

  res.json({ok:true,msg:"Registro exitoso"});

});

/* ================= LOGIN ================= */
app.post("/api/login", async(req,res)=>{

  try{

    if(req.body.email === ADMIN.email){

      if(req.body.password !== ADMIN.password){
        return res.json({ok:false,msg:"Clave admin incorrecta"});
      }

      return res.json({ok:true,rol:"admin"});
    }

    const user = await User.findOne({email:req.body.email});

    if(!user){
      return res.json({ok:false,msg:"Usuario no existe"});
    }

    const ok = await bcrypt.compare(req.body.password,user.password);

    if(!ok){
      return res.json({ok:false,msg:"Clave incorrecta"});
    }

    await actualizarGanancias(user);

    res.json({
      ok:true,
      rol:"user",
      user:{
        userId:user.userId,
        email:user.email,
        saldo:user.saldo,
        dias:user.dias,
        nequi:user.nequi,
        ultimaActualizacion:user.ultimaActualizacion
      }
    });

  }catch(err){

    res.json({ok:false,msg:"Error servidor"});

  }

});
      

/* ================= SOLICITUDES ================= */

app.get("/api/solicitudes", async(req,res)=>{

  const sol = await Solicitud.find({estado:"pendiente"});
  res.json(sol);

});

/* ================= APROBAR ================= */

    /* ================= APROBAR ================= */

app.post("/api/aprobar", async(req,res)=>{

try{

  if(req.body.adminKey !== "ADMIN123"){
    return res.json({ok:false,msg:"Acceso denegado"});
  }

  const s = await Solicitud.findById(req.body.id);
  if(!s) return res.json({ok:false});

  const u = await User.findOne({email:s.email});

  if(s.tipo==="inversion"){

    let ganancia = s.monto;

    if(s.monto==10) ganancia=16;
    else if(s.monto==20) ganancia=26;
    else if(s.monto==30) ganancia=40;
    else if(s.monto>30) ganancia=s.monto*1.5;

    u.saldo += ganancia;
    u.dias = 0;
    u.ultimaActualizacion = new Date();

    await u.save();

    if(u.referidoPor){

      const patrocinador = await User.findOne({email:u.referidoPor});

      if(patrocinador){
        patrocinador.saldo += 1;
        await patrocinador.save();
      }

    }

  }

  s.estado="aprobado";
  await s.save();

  let mensaje="";

  if(s.tipo==="inversion"){
    mensaje="Tu inversión fue aprobada y ya está generando ganancias.";
  }

  if(s.tipo==="retiro"){
    mensaje="Tu retiro fue aprobado y enviado a tu billetera.";
  }

  res.json({ok:true,msg:mensaje});

}catch(err){

  res.json({ok:false});

}

});

/* ================= RECHAZAR ================= */


    app.post("/api/rechazar", async(req,res)=>{

  if(req.body.adminKey !== "ADMIN123"){
    return res.json({ok:false,msg:"Acceso denegado"});
  }

    const s = await Solicitud.findById(req.body.id);
    if(!s) return res.json({ok:false});

    s.estado="rechazado";
    await s.save();

    res.json({ok:true});

  }catch(err){

    res.json({ok:false});

  }

});

/* ================= RETIRAR ================= */

app.post("/api/retirar", async(req,res)=>{

try{

const email = req.body.email.toLowerCase();
const monto = Number(req.body.monto);

const u = await User.findOne({email});

if(!u) return res.json({ok:false,msg:"Usuario no existe"});

if(!u.nequi){
return res.json({ok:false,msg:"Debes registrar tu número de Nequi"});
}

if(monto<=0) return res.json({ok:false,msg:"Monto inválido"});

if(monto>u.saldo){
return res.json({ok:false,msg:"Saldo insuficiente"});
}

if(monto<20){
return res.json({ok:false,msg:"Mínimo retiro 20 USDT"});
}

await Solicitud.create({
email:u.email,
monto:monto,
estado:"pendiente",
tipo:"retiro",
nequi:u.nequi
});

res.json({
ok:true,
msg:"Solicitud de retiro enviada"
});

}catch(err){

res.json({ok:false,msg:"Error servidor retirar"});

}

});
/* ================= MODIFICAR SALDO (ADMIN) ===*/
app.post("/api/modificar-saldo", async(req,res)=>{

try{

const email = req.body.email.trim();
const monto = Number(req.body.monto);

const u = await User.findOne({
email: { $regex: new RegExp("^" + email + "$","i") }
});

if(!u){
return res.json({ok:false,msg:"Usuario no encontrado"});
}

u.saldo = monto;
u.dias = 0;
u.ultimaActualizacion = new Date();

await u.save();

res.json({
ok:true,
msg:"Saldo actualizado correctamente"
});

}catch(err){

res.json({
ok:false,
msg:"Error al modificar saldo"
});

}

});
/* ================= EDITAR USUARIO ================= */

app.post("/api/editar-usuario", async(req,res)=>{

try{

const email = req.body.email;

const u = await User.findOne({email});

if(!u){
return res.json({ok:false,msg:"Usuario no encontrado"});
}

u.nombre = req.body.nombre || u.nombre;
u.email = req.body.nuevoEmail || u.email;
u.nequi = req.body.nequi || u.nequi;

await u.save();

res.json({
ok:true,
msg:"Usuario actualizado"
});

}catch(err){

res.json({
ok:false,
msg:"Error actualizando usuario"
});

}

});

/* ================= WALLET ================= */


   app.post("/api/wallet", async(req,res)=>{

  try{

  const u = await User.findOne({email:req.body.email});
    const u = await User.findOne({
email:req.body.email.toLowerCase()
});

    if(!u){
      return res.json({ok:false,msg:"Usuario no encontrado"});
    }

    u.nequi = req.body.nequi || "";
    

    await u.save();

    res.json({ok:true,msg:"Cuenta de retiro guardada correctamente"});

  }catch(err){

    res.json({ok:false,msg:"Error servidor"});

  }

});

/* ================= USUARIOS ================= */

app.get("/api/usuarios", async(req,res)=>{

  try{

    const users = await User.find().select("-password");
    res.json(users);

  }catch(err){

    res.json([]);

  }

});

/* ================= HISTORIAL ================= */

app.get("/api/historial/:email", async(req,res)=>{

  try{

    const email = req.params.email.toLowerCase();

    const historial = await Solicitud
      .find({email})
      .sort({fecha:-1})
      .limit(20);

    res.json(historial);

  }catch(err){

    res.json([]);

  }

});

/* ================= ID USUARIOS VIEJOS ================= */

async function ponerIdUsuariosViejos(){

  const usuarios = await User.find({userId:{$exists:false}});

  let contador = 1001;

  for(let u of usuarios){

    u.userId="USR-"+contador;
    await u.save();
    contador++;

  }

  console.log("IDs asignados a usuarios viejos");

}

ponerIdUsuariosViejos();

async function arreglarUsuariosSinNombre(){

const usuarios = await User.find({
$or:[
{nombre:{$exists:false}},
{nombre:""}
]
});

for(let u of usuarios){

u.nombre = "Usuario";

await u.save();

}

console.log("Usuarios sin nombre corregidos");

}

arreglarUsuariosSinNombre();
/* ================= SERVER ================= */

app.listen(PORT,()=>{
  console.log("🚀 Servidor activo en puerto "+PORT);
});
