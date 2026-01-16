// Mostrar secciones
function show(id){
document.querySelectorAll("section").forEach(s=>{
s.classList.remove("active");
});
document.getElementById(id).classList.add("active");
}

// Ver/ocultar contraseña
function ver(id){
let p=document.getElementById(id);
p.type=p.type=="password"?"text":"password";
}

// VARIABLES PANEL
let saldo=0,total=0,hoy=0;
let users=0,invTotal=0;

// REGISTRO
async function register(){
const data={
email:r_email.value,
password:r_pass.value
};
const res = await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});
const json = await res.json();
r_msg.innerText=json.msg;
}

// LOGIN
async function login(){
const data={
email:l_email.value,
password:l_pass.value
};
const res = await fetch("/api/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});
const json = await res.json();

if(json.ok){
localStorage.setItem("rol",json.rol);
alert("Bienvenido "+json.rol);
if(json.rol=="admin"){location="admin.html";}
else{location="panel.html";}
}else{
l_msg.innerText=json.msg;
}
}

// RECUPERAR CLAVE
async function forgot(){
const res = await fetch("/api/forgot",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({email:f_email.value})
});
const data = await res.json();
f_msg.innerText=data.msg;
}

// PANEL USUARIO - SIMULACIÓN INVERSION
function invertir(){
let val=parseInt(amount.value);
saldo+=val;
invTotal+=val;
hoy+=val*0.05;
total+=val*0.05;
update();
alert("Solicitud enviada al admin");
}

// ACTUALIZAR DATOS PANEL
function update(){
saldoTxt.innerText=saldo+" USDT";
hoyTxt.innerText=hoy.toFixed(2)+" USDT";
totalTxt.innerText=total.toFixed(2)+" USDT";
}

// LOGOUT
function logout(){
localStorage.clear();
location="login.html";
}


