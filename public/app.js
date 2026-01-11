let usuarioActual=null;

function show(id){
document.querySelectorAll("section").forEach(s=>{
s.classList.remove("active");
});
document.getElementById(id).classList.add("active");
}

// REGISTRO
async function register(){
const data={
nombre:nombre.value,
email:email.value,
password:password.value,
ref:ref.value
};

const res = await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

const json = await res.json();
msg.innerText=json.msg;
}

// LOGIN
async function login(){
const data={
email: loginEmail.value,
password: loginPass.value
};

const res = await fetch("/api/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

const json = await res.json();
loginMsg.innerText=json.msg;

if(json.ok){
usuarioActual=json.user;

document.getElementById("panel").innerHTML=`
<div class="box">
<h3>${json.msg}</h3>
<p>Saldo virtual: <b>${usuarioActual.balance} USD</b></p>
<p>Ganado hoy: <b>${usuarioActual.ganado} USD</b></p>
<p>Link referido:</p>
<input value="${window.location.href}?ref=${usuarioActual.email}" readonly>
</div>
`;

show("profits");
cargarEquipo();
}
}

// EQUIPO
function cargarEquipo(){
teamList.innerHTML="";
usuarioActual.equipo.forEach(e=>{
let li=document.createElement("li");
li.innerText=e;
teamList.appendChild(li);
});
}
