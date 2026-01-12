let usuarioActual=null;

let usuarios=[];
let solicitudes=[];
let historial=[];

// CREAR ADMIN FIJO
usuarios.push({
nombre:"Enrique",
correo:"enriquevega201618@gmail.com",
pass:"1998",
rol:"admin",
saldo:0,hoy:0,total:0
});

function show(id){
document.querySelectorAll('.card')
.forEach(x=>x.style.display="none");
document.getElementById(id).style.display="block";
}

show("login");

// REGISTRO CLIENTE
function register(){

let nombre=rname.value;
let correo=remail.value;
let pass=rpass.value;

usuarios.push({
nombre,correo,pass,
rol:"cliente",
saldo:0,hoy:0,total:0
});

alert("Cliente creado");
show("login");
}

// LOGIN
function login(){

let correo=lemail.value;
let pass=lpass.value;

let u=usuarios.find(x=>x.correo==correo && x.pass==pass);

if(!u){
alert("Datos incorrectos");
return;
}

usuarioActual=u;

if(u.rol=="admin"){
show("admin");
cargarSolicitudes();
}else{
show("panel");
actualizarPanel();
}
}

// CERRAR SESIÓN
function logout(){
usuarioActual=null;
alert("Sesión cerrada");
show("login");
}

// SOLICITAR INVERSIÓN
function invertir(){

let m=monto.value;

solicitudes.push({
usuario:usuarioActual,
monto:Number(m),
estado:"pendiente"
});

alert("Solicitud enviada al admin");
}

// PANEL CLIENTE
function actualizarPanel(){

saldo.innerText=usuarioActual.saldo.toFixed(2);
hoy.innerText=usuarioActual.hoy.toFixed(2);
total.innerText=usuarioActual.total.toFixed(2);

let h="";

historial
.filter(x=>x.correo==usuarioActual.correo)
.forEach(x=>{
h+=`<p>${x.fecha} - Ganó ${x.ganancia} USDT</p>`;
});

document.getElementById("historial").innerHTML=
h || "Sin movimientos";
}

// PANEL ADMIN
function cargarSolicitudes(){

let html="";

solicitudes.forEach((s,i)=>{

if(s.estado=="pendiente"){

html+=`
<p>
${s.usuario.nombre} quiere invertir ${s.monto} USDT
<button onclick="aprobar(${i})">Aceptar</button>
<button onclick="rechazar(${i})">Rechazar</button>
</p>
`;
}

});

admin.innerHTML=`
<h2>Panel ADMIN</h2>
<button onclick="logout()">Cerrar sesión</button>
${html || "No hay solicitudes"}
`;
}

// APROBAR
function aprobar(i){

let s=solicitudes[i];
let g=s.monto*0.04;

s.usuario.saldo+=g;
s.usuario.hoy+=g;
s.usuario.total+=g;

historial.push({
correo:s.usuario.correo,
ganancia:g,
fecha:new Date().toLocaleString()
});

s.estado="aprobado";
alert("Aprobado");
cargarSolicitudes();
}

// RECHAZAR
function rechazar(i){
solicitudes[i].estado="rechazado";
alert("Rechazado");
cargarSolicitudes();
}

