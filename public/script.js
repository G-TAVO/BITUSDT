let user=null;

let usuarios=[
{
nombre:"Enrique",
correo:"enriquevega201618@gmail.com",
pass:"1998",
rol:"admin",
saldo:0,hoy:0,total:0
}
];

let solicitudes=[];
let historial=[];

function show(id){
document.querySelectorAll(".card")
.forEach(x=>x.style.display="none");
document.getElementById(id).style.display="block";
}

show("login");

// REGISTRO
function register(){

let nombre=rname.value.trim();
let correo=remail.value.trim();
let pass=rpass.value.trim();

if(!nombre||!correo||!pass){
alert("Completa todo");
return;
}

if(usuarios.some(x=>x.correo==correo)){
alert("Correo ya existe");
return;
}

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

let c=lemail.value.trim();
let p=lpass.value.trim();

let u=usuarios.find(
x=>x.correo==c && x.pass==p
);

if(!u){
alert("Datos incorrectos");
return;
}

user=u;

if(u.rol=="admin"){
show("admin");
loadAdmin();
}else{
show("panel");
updatePanel();
}
}

// CERRAR
function logout(){
user=null;
show("login");
}

// SOLICITAR INVERSIÓN
function invertir(){

let m=Number(monto.value);

if(![10,20,30,40,50].includes(m)){
alert("Solo 10,20,30,40,50");
return;
}

solicitudes.push({
correo:user.correo,
monto:m,
estado:"pendiente"
});

alert("Solicitud enviada");
}

// GANANCIA
function calcular(m){
return {
10:0.4,
20:0.5,
30:0.6,
40:0.7,
50:0.8
}[m];
}

// PANEL CLIENTE
function updatePanel(){

saldo.innerText=user.saldo.toFixed(2);
hoy.innerText=user.hoy.toFixed(2);
total.innerText=user.total.toFixed(2);

let h="";

historial
.filter(x=>x.correo==user.correo)
.forEach(x=>{
h+=`<p>${x.fecha} +${x.gana}</p>`;
});

document.getElementById("historial").innerHTML=
h||"Sin movimientos";
}

// ADMIN
function loadAdmin(){

if(user.rol!="admin"){
alert("Acceso denegado");
logout();
}

let html="";

solicitudes.forEach((s,i)=>{

if(s.estado=="pendiente"){

html+=`
<p>
${s.correo} invierte ${s.monto}
<button onclick="aprobar(${i})">Aceptar</button>
<button onclick="rechazar(${i})">Rechazar</button>
</p>
`;

}

});

admin.innerHTML=`
<h2>ADMIN</h2>
<button onclick="logout()">Salir</button>
${html||"No solicitudes"}
`;
}

// APROBAR
function aprobar(i){

let s=solicitudes[i];
let u=usuarios.find(
x=>x.correo==s.correo
);

let g=calcular(s.monto);

u.saldo+=g;
u.hoy+=g;
u.total+=g;

historial.push({
correo:u.correo,
gana:g,
fecha:new Date().toLocaleString()
});

s.estado="ok";
loadAdmin();
}

// RECHAZAR
function rechazar(i){
solicitudes[i].estado="no";
loadAdmin();
}

// RETIRO
function retirar(){

if(user.saldo<20){
alert("Mínimo 20 USDT");
return;
}

alert("Solicitud enviada al admin");
user.saldo=0;
updatePanel();
}

