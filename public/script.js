let usuario=null;
let token=null;

function mostrar(id){
document.querySelectorAll(".box").forEach(x=>x.classList.add("oculto"));
document.getElementById(id).classList.remove("oculto");
}

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
.then(r=>r.json())
.then(d=>{
alert("Registro exitoso");
mostrar("login");
});
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

if(!d.ok)return alert("Error");

usuario=correo.value;
token=d.token;

if(d.rol=="admin"){
mostrar("admin");
cargarAdmin();
}else{
mostrar("panel");
generarLink(usuario);
}

});
}

// REFERIDOS
function generarLink(c){
linkRef.value=location.origin+"?ref="+c;
}

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
body:JSON.stringify({monto:montoRetiro.value})
})
.then(r=>r.json())
.then(d=>alert(d.msg));
}

// ADMIN
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
.then(r=>r.json())
.then(d=>{
alert(d.msg);
cargarAdmin();
});
}

// SALIR
function salir(){location.reload();}

