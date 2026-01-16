const express=require("express");
const fs=require("fs");
const bcrypt=require("bcrypt");
const app=express();
app.use(express.json());
app.use(express.static("public"));

const ADMIN_EMAIL="Binancecoin958@gmail.com";
const ADMIN_PASS=bcrypt.hashSync("Enriique1998",10);

if(!fs.existsSync("users.json")) fs.writeFileSync("users.json","[]");

const read=()=>JSON.parse(fs.readFileSync("users.json"));
const save=d=>fs.writeFileSync("users.json",JSON.stringify(d,null,2));

app.post("/api/register",async(req,res)=>{
 let u=read();
 if(u.find(x=>x.email==req.body.email))
 return res.json({msg:"Ya registrado"});
 u.push({
  email:req.body.email,
  pass:await bcrypt.hash(req.body.password,10),
  wallet:req.body.wallet,
  saldo:0,ganancias:0,inv:0,ret:0
 });
 save(u); res.json({msg:"Registro exitoso"});
});

app.post("/api/login",async(req,res)=>{
 if(req.body.email==ADMIN_EMAIL){
  let ok=await bcrypt.compare(req.body.password,ADMIN_PASS);
  if(!ok)return res.json({msg:"Admin incorrecto"});
  return res.json({ok:true,rol:"admin"});
 }
 let u=read().find(x=>x.email==req.body.email);
 if(!u)return res.json({msg:"No existe"});
 let ok=await bcrypt.compare(req.body.password,u.pass);
 if(!ok)return res.json({msg:"Clave incorrecta"});
 res.json({ok:true,rol:"user",user:u});
});

app.post("/api/invert",(req,res)=>{
 let u=read(); let x=u.find(v=>v.email==req.body.email);
 x.inv=req.body.amount; save(u); res.json({ok:true});
});

app.post("/api/retire",(req,res)=>{
 let u=read(); let x=u.find(v=>v.email==req.body.email);
 if(x.saldo>=20)x.ret=x.saldo;
 save(u); res.json({ok:true});
});

app.get("/api/admin",(req,res)=>res.json(read()));

app.post("/api/admin/inv",(req,res)=>{
 let u=read(); let x=u.find(v=>v.email==req.body.email);
 x.saldo+=x.inv;
 x.ganancias+=x.inv*0.05;
 x.inv=0; save(u); res.json({ok:true});
});

app.post("/api/admin/ret",(req,res)=>{
 let u=read(); let x=u.find(v=>v.email==req.body.email);
 x.saldo=0; x.ganancias=0; x.ret=0;
 save(u); res.json({ok:true});
});

app.listen(process.env.PORT||3000);
