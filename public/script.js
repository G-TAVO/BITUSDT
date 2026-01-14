async function login(){
 let res=await fetch("/api/login",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
   email:loginEmail.value,
   password:loginPass.value
  })
 });
 let j=await res.json();
 loginMsg.innerText=j.msg||"";

 if(j.ok){
  if(j.rol=="admin") location="/admin";
  else location="panel.html";
 }
}

function guardarWallet(){
 fetch("/api/wallet",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({wallet:wallet.value})
 });
 alert("Wallet guardada");
}

function invertir(){
 fetch("/api/solicitar",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({monto:monto.value})
 });
 alert("Solicitud enviada");
}

async function cargar(){
 let r=await fetch("/api/solicitudes");
 let d=await r.json();

 solicitudes.innerHTML="";
 d.forEach(s=>{
  solicitudes.innerHTML+=`
  <div class="card">
   <b>${s.email}</b><br>
   Monto: ${s.monto}<br>
   Wallet: ${s.wallet}<br>
   <button onclick="aprobar(${s.id})">Aprobar</button>
  </div>`;
 });
}

async function aprobar(id){
 await fetch("/api/aprobar",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({id})
 });
 cargar();
}

if(typeof solicitudes!="undefined") cargar();


