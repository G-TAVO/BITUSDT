function show(id){
document.querySelectorAll('.card')
.forEach(x=>x.style.display="none");
document.getElementById(id).style.display="block";
}

show("register");

// SIMULACIÓN
let saldo=0, hoy=0, total=0, usuarios=0, invertido=0;

function register(){
usuarios++;
alert("Registro exitoso (simulado)");
document.getElementById("u").innerText=usuarios;
}

function login(){
alert("Login correcto (simulado)");
show("panel");
}

function invertir(){
let m=Number(monto.value);
let ganancia=m*0.15;
saldo+=ganancia;
hoy+=ganancia;
total+=ganancia;
invertido+=m;

saldoUI();
document.getElementById("inv").innerText=invertido;
}

function saldoUI(){
saldo.innerText=saldo.toFixed(2);
hoy.innerText=hoy.toFixed(2);
total.innerText=total.toFixed(2);
}
