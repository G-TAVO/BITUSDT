// =====================
// VARIABLES
// =====================
let usuarioActual = null;
let rolActual = null;

// =====================
// AL CARGAR PÁGINA
// =====================
document.addEventListener("DOMContentLoaded", ()=>{

// detectar referido
let params = new URLSearchParams(window.location.search);
let ref = params.get("ref");

if(ref){
localStorage.setItem("referido", ref);
}

});

// =====================
// LOGIN
// =====================
function login(){

let correo = document.getElementById("correo").value;
let pass = document.getElementById("password").value;

fetch("/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
correo,
pass
})
})
.then(r=>r.json())
.then(data=>{

if(data.ok){

usuarioActual = correo;
rolActual = data.rol;

if(rolActual=="admin"){
mostrar("admin");
}

if(rolActual=="cliente"){
mostrar("panel");
generarLink(correo);
}

}else{
alert("Datos incorrectos");
}

});

}

// =====================
// MOSTRAR SECCIONES
// =====================
function mostrar(id){

document.querySelectorAll(".vista").forEach(v=>{
v.style.display="none";
});

document.getElementById(id).style.display="block";

}

// =====================
// REFERIDOS
// =====================
function generarLink(correo){
let l = location.origin + "/?ref=" + correo;
document.getElementById("linkRef").value = l;
}

function copiar(){
let input = document.getElementById("linkRef");
navigator.clipboard.writeText(input.value);
alert("Link copiado");
}

// =====================
// REGISTRO
// =====================
function registrar(){

let correo = document.getElementById("rCorreo").value;
let pass = document.getElementById("rPass").value;

let ref = localStorage.getItem("referido");

fetch("/register",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
correo,
pass,
ref
})
})
.then(r=>r.json())
.then(data=>{
alert(data.msg);
});

}

// =====================
// CERRAR SESIÓN
// =====================
function salir(){
location.reload();
}

// =====================
// INVERTIR
// =====================
function invertir(monto){

fetch("/invertir",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
correo:usuarioActual,
monto
})
})
.then(r=>r.json())
.then(data=>{
alert(data.msg);
});

}

