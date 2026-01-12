let usuarioActual=null;
let esAdmin=false;

let usuarios=[];
let solicitudes=[];

// MOSTRAR SECCIONES
function show(id){
document.querySelectorAll('.card')
.forEach(x=>x.style.display="none");
document.getElementById(id).style.display="block";
}

show("login");

// REGISTRO
function register(){

let nombre=rname.value;
let correo=remail.value;
let pass=rpass.value;

usuarios.push({
nombre,correo,pass,
saldo:0,hoy:0,total:0
});

alert("Usuario creado");
show("login");
}

// LOGIN
function login(){

let correo=lemail.value;
let pass=lpass.value;

// ADMIN
if(correo=="enriquevega201618@gmail.com" && pass=="1998"){
usuarioActual="ADMIN";
esAdmin=true;
alert("Admin conectado");
show("admin");
cargarSolicitudes();
return;
}

// CLIENTE
let u=usuarios.find(x=>x.correo==correo && x.pass==pass);

if(!u){
alert("Datos incorrectos");
return;
}

usuarioActual=u;
esAdmin=false;

alert("Bienvenido "+u.nombre);
show("panel");
actualizarPanel();
}

// SOLICITAR INVERSIÓN
function invertir(){

if(!usuarioActual){
alert("Debe iniciar sesión");
return;
}

let m=monto.value;

if(m==""){
alert("Seleccione monto");
return;
}

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
<h2>🔐 Panel administrador</h2>
${html || "No hay solicitudes"}
`;
}

// APROBAR
function aprobar(i){

let s=solicitudes[i];
let ganancia=s.monto*0.04;

s.usuario.saldo+=ganancia;
s.usuario.hoy+=ganancia;
s.usuario.total+=ganancia;

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

