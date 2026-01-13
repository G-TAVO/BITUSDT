let token = localStorage.getItem("token");

// REGISTRO
function registrar(){

fetch("/register",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
correo:rCorreo.value,
pass:rPass.value
})
})
.then(()=>location.href="login.html");
}

// LOGIN
function login(){

fetch("/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
correo:correo.value,
pass:password.value
})
})
.then(r=>r.json())
.then(d=>{

if(!d.ok) return alert("Error");

localStorage.setItem("token",d.token);
localStorage.setItem("rol",d.rol);

if(d.rol=="admin"){
location.href="admin.html";
}else{
location.href="panel.html";
}

});
}

// PANEL
function ver(id){
document.querySelectorAll(".box")
.forEach(x=>x.classList.add("oculto"));
document.getElementById(id)
.classList.remove("oculto");
}

// REFERIDOS
function copiar(){
navigator.clipboard.writeText(linkRef.value);
alert("Copiado");
}

// INVERTIR
function invertir(m){

fetch("/invertir",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":token
},
body:JSON.stringify({monto:m})
})
.then(r=>r.json())
.then(d=>alert(d.msg));
}

// RETIRO
function retirar(){

fetch("/retirar",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":token
},
body:JSON.stringify({
monto:montoRetiro.value
})
})
.then(r=>r.json())
.then(d=>alert(d.msg));
}

// ADMIN
if(location.pathname.includes("admin")){
cargarAdmin();
}

function cargarAdmin(){

fetch("/admin/inversiones",{
headers:{"Authorization":token}
})
.then(r=>r.json())
.then(data=>{
lista.innerHTML="";
data.forEach(i=>{
lista.innerHTML+=`
<p>${i.correo} - ${i.monto}
<button onclick="aprobar('${i._id}')">Aprobar</button>
</p>`;
});
});
}

function aprobar(id){

fetch("/admin/aprobar",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":token
},
body:JSON.stringify({id})
})
.then(()=>cargarAdmin());
}

function salir(){
localStorage.clear();
location.href="login.html";
}


