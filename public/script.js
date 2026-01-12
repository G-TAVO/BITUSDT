let logueado=false;
let saldo=0,hoy=0,total=0;
let usuarios=0, invertido=0;

function show(id){
document.querySelectorAll('.card')
.forEach(x=>x.style.display="none");
document.getElementById(id).style.display="block";
}

show("login");

function register(){
usuarios++;
alert("Registro exitoso");
document.getElementById("u").innerText=usuarios;
show("login");
}

function login(){
logueado=true;
alert("Sesión iniciada");
show("panel");
}

function invertir(){

if(!logueado){
alert("Debes iniciar sesión");
return;
}

let m=document.getElementById("monto").value;

if(m==""){
alert("Seleccione monto");
return;
}

m=Number(m);

let ganancia=m*0.04; // 4%

saldo+=ganancia;
hoy+=ganancia;
total+=ganancia;
invertido+=m;

document.getElementById("saldo").innerText=saldo.toFixed(2);
document.getElementById("hoy").innerText=hoy.toFixed(2);
document.getElementById("total").innerText=total.toFixed(2);
document.getElementById("inv").innerText=invertido;

alert("Invertido "+m+" USDT | Ganancia "+ganancia.toFixed(2));
}

