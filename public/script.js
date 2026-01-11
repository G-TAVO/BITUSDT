
let myCode="";

// capturar referido
const params=new URLSearchParams(window.location.search);
const r=params.get("ref");
if(r){ref.value=r;}

function show(id){
document.querySelectorAll("section").forEach(s=>s.classList.remove("active"));
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

const res=await fetch("/api/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

const json=await res.json();
msg.innerText=json.msg;
}

// LOGIN
async function login(){
const data={
email:loginEmail.value,
password:loginPass.value
};

const res=await fetch("/api/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(data)
});

const json=await res.json();
loginMsg.innerText=json.msg;

if(json.ok){
myCode=json.code;

panel.innerHTML=`
<p><b>Tu código:</b> ${myCode}</p>
<input value="https://bitusdt.onrender.com/?ref=${myCode}" readonly>
<button onclick="copy()">Copiar link</button>
`;

show("profits");
}
}

// COPIAR LINK
function copy(){
const i=document.querySelector("#panel input");
navigator.clipboard.writeText(i.value);
alert("Link copiado");
}

// VER EQUIPO
async function loadTeam(){
const res=await fetch("/api/team",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({code:myCode})
});

const json=await res.json();
teamBox.innerHTML="";

if(json.team.length==0){
teamBox.innerHTML="Sin referidos";
return;
}

json.team.forEach(u=>{
teamBox.innerHTML+=`<p>${u.nombre} (${u.email})</p>`;
});
}

document.getElementById("team").addEventListener("click",loadTeam);

// ADMIN
async function loadAdmin(){
const res=await fetch("/api/admin");
const json=await res.json();
adminBox.textContent=JSON.stringify(json,null,2);
}
